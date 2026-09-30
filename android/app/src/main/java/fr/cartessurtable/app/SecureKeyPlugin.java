package fr.cartessurtable.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.Arrays;

import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Clé qui chiffre la partie (voir src/lib/vault.ts). C'est une clé AES-256 tirée au hasard, rangée chiffrée par une clé du
 * Keystore Android : celle-ci reste dans le matériel sécurisé du téléphone et n'en sort jamais. Copier les fichiers de
 * l'application, même sur un téléphone rooté, ne donne donc que des données illisibles.
 */
@CapacitorPlugin(name = "SecureKey")
public class SecureKeyPlugin extends Plugin {
    private static final String KEYSTORE = "AndroidKeyStore";
    private static final String ALIAS = "cst-cle-partie";
    private static final String PREFS = "cst-coffre";
    private static final String WRAPPED = "cle";
    private static final int IV_LENGTH = 12;

    @PluginMethod
    public void getKey(PluginCall call) {
        byte[] key = null;
        try {
            key = loadOrCreate();
            JSObject ret = new JSObject();
            ret.put("key", Base64.encodeToString(key, Base64.NO_WRAP));
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Clé de chiffrement indisponible", e);
        } finally {
            if (key != null) Arrays.fill(key, (byte) 0);
        }
    }

    @PluginMethod
    public void deleteKey(PluginCall call) {
        try {
            synchronized (this) {
                prefs().edit().remove(WRAPPED).commit();
                KeyStore ks = KeyStore.getInstance(KEYSTORE);
                ks.load(null);
                ks.deleteEntry(ALIAS);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Clé de chiffrement non effacée", e);
        }
    }

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private synchronized byte[] loadOrCreate() throws Exception {
        KeyStore ks = KeyStore.getInstance(KEYSTORE);
        ks.load(null);
        SecretKey master = (SecretKey) ks.getKey(ALIAS, null);
        boolean newMaster = master == null;
        if (newMaster) master = createMaster();

        String stored = prefs().getString(WRAPPED, null);
        if (stored != null && !newMaster) {
            try {
                return unwrap(master, Base64.decode(stored, Base64.NO_WRAP));
            } catch (AEADBadTagException e) {
                // Clé rangée illisible : on repart d'une clé neuve (l'ancienne partie est perdue, jamais exposée).
            }
        }
        // Toute autre erreur remonte sans rien écraser : un Keystore momentanément indisponible ne doit pas effacer la partie.
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        prefs().edit().putString(WRAPPED, Base64.encodeToString(wrap(master, key), Base64.NO_WRAP)).commit();
        return key;
    }

    private static SecretKey createMaster() throws Exception {
        KeyGenerator gen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE);
        gen.init(
            new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        );
        return gen.generateKey();
    }

    private static byte[] wrap(SecretKey master, byte[] key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, master);
        byte[] iv = cipher.getIV();
        byte[] sealed = cipher.doFinal(key);
        byte[] out = new byte[iv.length + sealed.length];
        System.arraycopy(iv, 0, out, 0, iv.length);
        System.arraycopy(sealed, 0, out, iv.length, sealed.length);
        return out;
    }

    private static byte[] unwrap(SecretKey master, byte[] data) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, master, new GCMParameterSpec(128, data, 0, IV_LENGTH));
        return cipher.doFinal(data, IV_LENGTH, data.length - IV_LENGTH);
    }
}
