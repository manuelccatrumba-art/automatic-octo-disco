# Touch Love — material de submissão à Google Play Console

Este ficheiro reúne o texto pronto a copiar/colar para as três partes do Play Console que exigem conteúdo
escrito: a declaração de permissão de localização em segundo plano, o formulário Data Safety, e o questionário
de classificação de conteúdo (IARC). Não é código da app — é só para a tua submissão manual na consola.

---

## 1. Declaração de permissão `ACCESS_BACKGROUND_LOCATION`

A Play Console pede um formulário específico sempre que uma app pede esta permissão. Usa isto:

**Que funcionalidade principal precisa desta permissão?**
> O Touch Love deteta quando duas pessoas que marcaram "crush" mútuo estão fisicamente perto uma da outra, e
> revela essa correspondência através de um alarme. Esta é a única funcionalidade central da app — sem
> localização em segundo plano, o alarme só funcionaria enquanto a app estivesse aberta em primeiro plano, o
> que quebra completamente o conceito (a app teria de estar sempre aberta para detetar alguém por perto).

**Porque é que a localização em primeiro plano não é suficiente?**
> O objetivo é que o alarme dispare de forma passiva, mesmo com o telemóvel no bolso e a app fechada — é essa
> deteção contínua de proximidade que dá sentido ao conceito. Exigir que o utilizador mantenha a app aberta
> constantemente eliminaria o propósito do produto.

**Como é isto comunicado ao utilizador antes do pedido de permissão?**
> Depois do login, mostramos um ecrã de divulgação proeminente (`app/onboarding/background-disclosure.tsx`)
> com o texto: *"Esta app recolhe dados de localização para ativar o alarme de proximidade mesmo quando a app
> está fechada ou não está a ser utilizada."* — só depois deste ecrã, e só se o utilizador escolher "Ativar
> alarme em segundo plano", é pedida a permissão do sistema. O utilizador pode recusar e continuar a usar a
> app só em primeiro plano.

**Notificação persistente:** enquanto o alarme está ativo em segundo plano, o Android mostra uma notificação
permanente (serviço em primeiro plano) a indicar que a localização está a ser monitorizada.

---

## 2. Formulário Data Safety

### Recolha e partilha de dados

| Tipo de dado | Recolhido? | Partilhado com terceiros? | Opcional/Obrigatório | Finalidade |
|---|---|---|---|---|
| Localização aproximada | Sim | Não | Obrigatório | Funcionalidade da app (alarme de proximidade) |
| Localização precisa | Sim | Não | Obrigatório | Funcionalidade da app (alarme de proximidade) |
| Nome (nome a exibir) | Sim | Não | Obrigatório | Funcionalidade da app, gestão de conta |
| Nome de utilizador / ID de conta | Sim | Não | Obrigatório | Funcionalidade da app, gestão de conta |
| Password | Sim (guardada como hash, nunca em texto simples) | Não | Obrigatório | Autenticação |

### Categorias a marcar como "não recolhidas"
Informação financeira, informação de saúde, mensagens/conteúdo de chat (a app não tem chat), fotos/vídeos,
contactos, histórico de navegação, identificadores de publicidade, dados de terceiros para publicidade.

### Práticas de segurança
- Dados transmitidos por HTTPS/TLS (encriptação em trânsito) — **Sim**.
- O utilizador pode pedir a eliminação dos seus dados — **Sim**: botão "Apagar conta" na app (Perfil → Apagar
  conta), eliminação imediata e definitiva de conta, localização, crushes, matches e bloqueios.
- Passwords nunca guardadas em texto simples (bcrypt hash) — mencionar nas práticas de segurança se o
  formulário perguntar sobre encriptação de credenciais.
- Não há retenção de histórico de localização — cada atualização substitui a anterior, não guardamos posições
  antigas.

### "É esta recolha de dados obrigatória para usar a app?"
Sim, para localização — é o mecanismo central. Sim, para os campos de conta no registo.

---

## 3. Questionário de classificação de conteúdo (IARC)

O Play Console calcula a classificação final a partir das tuas respostas — isto é um rascunho das respostas
esperadas, não a classificação em si.

| Pergunta típica do IARC | Resposta |
|---|---|
| Violência | Não |
| Conteúdo sexual/nudez | Não (não há conteúdo desse tipo dentro da app) |
| Linguagem imprópria | Não |
| Substâncias controladas | Não |
| Jogo/apostas simuladas | Não |
| Compras dentro da app | Não (atualmente) |
| **Os utilizadores podem interagir ou comunicar entre si?** | **Sim** |
| **A app partilha a localização do utilizador com outros utilizadores?** | **Sim** (proximidade relativa, não coordenadas exatas) |
| A app permite conhecer/interagir com estranhos com base na localização | **Sim** |

As duas últimas respostas ("interação entre utilizadores" + "partilha de localização/contacto com
estranhos") normalmente elevam a classificação para **Adolescente/Mature 17+ (ESRB) / PEGI 16** em apps deste
género (equivalente a outras apps de dating/proximidade). Recomendo assumir e planear para essa faixa — não
tentes contornar respondendo "não" a estas perguntas, isso viola os termos da Play Console e arrisca remoção
da app.

---

## 4. Checklist final antes de submeter

- [ ] Ícone adaptativo e ícone de app atualizados (feito nesta sessão — `assets/icon.png`,
      `assets/android-icon-*.png`)
- [ ] Política de Privacidade acessível publicamente: `https://touch-love-backend.vercel.app/privacy`
- [ ] Termos de Serviço acessíveis publicamente: `https://touch-love-backend.vercel.app/terms`
- [ ] Links para Privacidade/Termos dentro da app (ecrã de registo + perfil) — feito nesta sessão
- [ ] Ecrã de divulgação proeminente antes do pedido de permissão de background location — já implementado
- [ ] Conta de developer Google Play criada (25 USD, pagamento único) — **contigo**
- [ ] Vídeo de 30s demonstrando o alarme a funcionar com a app em segundo plano — **contigo**, guião abaixo

### Guião do vídeo de demonstração (30s)

1. (0-5s) Mostra o ecrã de perfil com o alarme ativo, depois fecha a app (vai para o ecrã principal do Android).
2. (5-15s) Com a app fechada, outro dispositivo/conta (ou tu a simular deslocação) aproxima-se do "crush"
   mútuo. Mostra o telemóvel bloqueado ou com outra app aberta.
3. (15-25s) Aparece a notificação push do alarme a disparar, mesmo com a Touch Love fechada/em segundo plano.
4. (25-30s) Abre a notificação, mostra o ecrã de match revelado dentro da app.

Isto demonstra visualmente à equipa de revisão da Play Store que a localização em segundo plano é essencial
ao funcionamento anunciado, não decorativa.
