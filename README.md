# Nox Desktop

Companheiro flutuante para macOS e Windows. O Nox fica transparente, sempre visível e responde à sua presença.

## Estado visual atual

Enquanto a malha 3D fiel ao Nox original está sendo construída, o app usa a fileira de idle estável do atlas original — sem cortes, sem aura e sem usar a caminhada antiga fora de contexto. O protótipo WebGL continua preservado no histórico da branch, mas não é exibido pelo app.

## Como interagir

- Clique: desperta a atenção do Nox.
- Arraste-o pelo corpo para escolher onde ele fica.
- Menu do ícone na barra superior/bandeja: tamanho, rotina e cliques atravessando.

O tamanho e as preferências ficam salvos localmente. A caminhada, a forma bípede e a transformação voltam quando cada uma tiver sua animação e malha 3D aprovadas.

## Rodar localmente

```bash
npm install
npm start
```

## Gerar instalador

No macOS:

```bash
npm run package:mac
```

No Windows:

```bash
npm run package:win
```

Use o menu do ícone do Nox para trazer de volta, configurar seu tamanho, controlar a rotina ou deixar cliques atravessarem o pet.
