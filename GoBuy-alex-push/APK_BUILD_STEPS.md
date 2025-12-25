# Guia: Gerar APK do projeto (Expo/EAS)

Este guia mostra como configurar e gerar um APK instalável para Android usando EAS Build. As instruções estão otimizadas para Windows PowerShell.

## 1) Pré‑requisitos
- Conta Expo/EAS e login ativo:
```powershell
eas whoami
# Se necessário:
eas login
```
- Projeto linkado ao EAS (com git inicializado):
```powershell
cd "C:\Users\Alexandre Café\Downloads\GoBuy-alex-push\GoBuy-alex-push\goebuy"
git init; git add -A; git commit -m "Initial commit"
eas project:info
# Se não estiver linkado:
eas init
```
- Verifique o `app.json`:
  - `android.package` válido (ex.: `com.goebuy.app`).
  - Splash existente (ex.: `./assets/splash.png`).
  - `extra.eas.projectId` deve ser um UUID válido (foi corrigido).

## 2) Configurar perfil APK no `eas.json`
Para gerar APK (em vez de AAB), crie/edite um perfil com `buildType: "apk"`.

Exemplo mínimo:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```
- Coloque esse bloco dentro de `goebuy/eas.json` (sem apagar outros perfis). 
- `distribution: "internal"` gera APK para instalação direta.

## 3) Rodar o build APK (remoto no EAS)
```powershell
cd "C:\Users\Alexandre Café\Downloads\GoBuy-alex-push\GoBuy-alex-push\goebuy"
eas build -p android --profile preview
```
- Acompanhe os logs e aguarde o término.
- Ao finalizar, o EAS fornecerá um link para baixar o APK.

## 4) APK Debug (opcional, build local)
Para um APK debug rápido (útil para testes):
```powershell
cd "C:\Users\Alexandre Café\Downloads\GoBuy-alex-push\GoBuy-alex-push\goebuy"
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```
- O arquivo será gerado em `android/app/build/outputs/apk/debug/`. 
- Em Windows PowerShell, use `.\u0067radlew assembleDebug`.

## 5) Pós‑build
- Instalar no dispositivo via ADB (opcional):
```powershell
adb install path\para\app.apk
```
- Compartilhar o APK internamente (link do EAS ou arquivo direto).

## 6) Erros comuns e correções
- "Invalid UUID appId":
  - Faça `eas init`/`eas project:init --account <owner>`.
  - Garanta que `extra.eas.projectId` seja um UUID válido do seu projeto.
- Falha no Prebuild (ENOENT em splash):
  - Corrija `app.json` para apontar para um arquivo existente, ex.: `./assets/splash.png`.
- AAPT erros ao compilar imagens (PNG/WEBP):
  - Evite imagens interlaced/corrompidas; converta para PNG sRGB.
  - Use apenas assets validados (ex.: `./assets/icon.png`).
- Conflitos de dependência (npm ERESOLVE):
  - Alinhe Expo SDK e React Native (recomendo atualizar para SDK 55 se já está no RN 0.81.x).
  - Atualize React Navigation com `npx expo install`.

## 7) Dicas
- Sempre versionar (`git commit`) antes de cada build.
- Use perfis diferentes para produção (AAB) e preview (APK).
- Se a fila do EAS estiver longa, você pode alternar para builds noturnos ou considerar plano pago.
