import Foundation
import Security
import Capacitor

/// Clé qui chiffre la partie (voir src/lib/vault.ts), rangée dans le trousseau de l'appareil : lisible seulement quand il est
/// déverrouillé, jamais synchronisée avec iCloud ni restaurable sur un autre appareil.
@objc(SecureKeyPlugin)
public class SecureKeyPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SecureKeyPlugin"
    public let jsName = "SecureKey"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getKey", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteKey", returnType: CAPPluginReturnPromise)
    ]

    private let item: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: "fr.cartessurtable.app.coffre",
        kSecAttrAccount as String: "cle-partie"
    ]

    @objc func getKey(_ call: CAPPluginCall) {
        var query = item
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var found: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &found)
        if status == errSecSuccess, let key = found as? Data, key.count == 32 {
            call.resolve(["key": key.base64EncodedString()])
            return
        }
        // Trousseau verrouillé ou indisponible : on n'écrase rien, la partie reste en mémoire le temps de la visite.
        guard status == errSecSuccess || status == errSecItemNotFound else {
            call.reject("Clé de chiffrement indisponible (\(status))")
            return
        }

        var key = Data(count: 32)
        let random = key.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!) }
        guard random == errSecSuccess else {
            call.reject("Tirage aléatoire impossible (\(random))")
            return
        }
        SecItemDelete(item as CFDictionary)
        var attributes = item
        attributes[kSecValueData as String] = key
        attributes[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        let added = SecItemAdd(attributes as CFDictionary, nil)
        guard added == errSecSuccess else {
            call.reject("Clé de chiffrement non enregistrée (\(added))")
            return
        }
        call.resolve(["key": key.base64EncodedString()])
    }

    @objc func deleteKey(_ call: CAPPluginCall) {
        let status = SecItemDelete(item as CFDictionary)
        if status == errSecSuccess || status == errSecItemNotFound {
            call.resolve()
        } else {
            call.reject("Clé de chiffrement non effacée (\(status))")
        }
    }
}

/// Contrôleur de l'application : celui de Capacitor, plus les plugins propres à l'application.
class AppViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SecureKeyPlugin())
    }
}
