package fr.cartessurtable.app;

import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SecureKeyPlugin.class);
        super.onCreate(savedInstanceState);
        // Écran des applications récentes : le système n'enregistre pas de capture de la partie ou des résultats.
        // Les captures d'écran volontaires restent possibles (pour partager ses résultats).
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) setRecentsScreenshotEnabled(false);
    }
}
