# Nox Desktop

Companheiro flutuante para macOS e Windows. O Nox fica transparente, sempre visível e responde à sua presença.

## Estado visual atual

Enquanto a malha 3D fiel ao Nox original é lapidada, o app usa a fileira de idle estável do atlas original — sem cortes, sem aura e sem usar a caminhada antiga fora de contexto. A malha 3D quadrúpede é gerada em `assets/models/nox-quadruped-prototype.glb` como base mecânica separada e ainda não é exibida no app.

Ela contém peças articuladas e os clips `quadruped_idle` e `quadruped_walk`. Para regenerá-la e verificar se outro carregador glTF consegue abri-la:

```bash
npm run export:mesh
npm run check:mesh
```

Para abrir a malha em uma janela separada de inspeção 3D — sem alterar o pet 2D — use:

```bash
npm run inspect:3d
```

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
