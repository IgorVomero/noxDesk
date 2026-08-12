# Nox Desktop

Companheiro flutuante para macOS e Windows. O Nox fica transparente, sempre visível e responde à sua presença. Esta versão está dedicada a polir primeiro a forma quadrúpede.

## Como interagir

- Clique: desperta a atenção do Nox.
- Arraste-o pelo corpo para escolher onde ele fica.
- Menu do ícone na barra superior/bandeja: tamanho, rotina e cliques atravessando.

O tamanho e as preferências ficam salvos localmente. A rotina regula apenas os estados de atenção e descanso até o pack de animações quadrúpedes estar concluído — o Nox não usa mais uma sequência de corrida inconsistente para fingir deslocamento.

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
