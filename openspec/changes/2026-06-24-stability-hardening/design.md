## Context

O layout raiz usa `next/font/google` com Geist e Geist Mono. Embora o `next/font` faça self-hosting no artefato final, a etapa de build ainda precisa buscar os arquivos no provedor quando eles não estão em cache. Isso torna o build frágil em ambientes sem rede. Em paralelo, cinco formulários cliente usam `watch()` do `useForm()`, e o React Compiler do stack atual emite warnings de incompatibilidade para esse padrão.

## Goals / Non-Goals

**Goals:**
- Garantir que o build rode sem depender de acesso ao Google Fonts
- Eliminar warnings atuais do compilador ligados a observação de campos de formulário
- Preservar o comportamento atual das telas

**Non-Goals:**
- Redesenhar a identidade visual
- Trocar a biblioteca de formulários
- Introduzir novas features funcionais

## Decisions

### Tipografia local e autocontida

O shell deixará de importar `next/font/google` e passará a usar variáveis CSS com pilhas de fontes locais para `sans` e `mono`. **Por quê:** remove a dependência de rede no build com impacto visual pequeno e previsível.

### Observação de campos com `useWatch`

Os componentes de formulário trocarão `watch()` por `useWatch()` nos campos usados para dirigir UI condicional e selects controlados. **Por quê:** é o caminho compatível com o React Compiler no stack atual e mantém o mesmo comportamento de reatividade.

## Risks / Trade-offs

- A renderização tipográfica pode variar um pouco entre sistemas operacionais, porque passará a usar fontes locais
- A troca para `useWatch()` exige cuidado para manter os mesmos defaults e valores vazios dos selects
