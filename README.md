# Nox Desktop

Companheiro flutuante para macOS e Windows. O Nox fica transparente, sempre visível e responde à sua presença.

## Protótipo 3D

O quadrúpede atual é um protótipo WebGL real com Three.js: corpo, patas, rodas, cauda, pescoço e olhos são peças 3D independentes. A caminhada articula as juntas e desloca o Nox na mesma cadência. A identidade visual segue o Nox original de armadura grafite, rodas douradas e linhas roxas; a malha de produção, a forma bípede e a transformação serão as próximas etapas.

## Como interagir

- Clique: desperta a atenção do Nox; os olhos ficam vermelhos no estado de alerta.
- Arraste-o pelo corpo para escolher onde ele fica.
- Menu do ícone na barra superior/bandeja: tamanho, rotina e cliques atravessando.

O tamanho e as preferências ficam salvos localmente. A rotina alterna entre repouso, observação e caminhada; a forma bípede e a transformação entram depois que o ciclo quadrúpede estiver aprovado.

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
