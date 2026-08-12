# Nox Desktop

Companheiro flutuante para macOS e Windows. O Nox fica transparente, sempre visível e vive no desktop: patrulha, observa, cochila e responde à sua presença.

## Como interagir

- Clique: o Nox cumprimenta você.
- Clique duplo: ele alterna entre a forma felina e a forma guardião.
- Arraste-o pelo corpo para escolher onde ele fica.
- Menu do ícone na barra superior/bandeja: tamanho, autonomia, cliques atravessando e transformação.

O tamanho e as preferências ficam salvos localmente. Com a autonomia ativa, o Nox se move pelo monitor de tempos em tempos; pausar essa opção o deixa quieto onde estiver.

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

Use o menu do ícone do Nox para trazer de volta, configurar seu tamanho, controlar a autonomia ou deixar cliques atravessarem o pet.
