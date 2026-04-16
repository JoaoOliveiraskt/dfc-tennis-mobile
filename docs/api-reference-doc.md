# Documentacao da API (Web + Mobile BFF)

Referencia objetiva do backend atual, incluindo o novo layer HTTP para clientes mobile (Expo) sem regressao dos fluxos web.

---

## 1) Contrato HTTP padrao (novos endpoints `/api/**`)

### Envelope de sucesso

```json
{
  "data": {}
}
```

Opcional:

```json
{
  "data": {},
  "meta": {}
}
```

### Envelope de erro

```json
{
  "error": {
    "code": "DOMAIN_ERROR_CODE",
    "message": "Mensagem legivel",
    "details": {}
  }
}
```

### Autenticacao

- Mobile: `Authorization: Bearer <token>`
- Web (compatibilidade): sessao/cookies atuais
- Durante migracao, ambos os formatos continuam suportados.

### Idempotencia

- Obrigatorio: `POST /api/bookings/intent`, `POST /api/wallet/deposit`
- Header: `Idempotency-Key`
- Mesmo payload + mesma chave: replay seguro da resposta anterior
- Mesmo key + payload diferente: `409 IDEMPOTENCY_KEY_CONFLICT`

---

## 2) Error Codes (API BFF)

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `BAD_REQUEST`
- `RATE_LIMITED`
- `NOT_FOUND`
- `CONFLICT`
- `DOMAIN_ERROR`
- `IDEMPOTENCY_KEY_REQUIRED`
- `IDEMPOTENCY_KEY_CONFLICT`
- `IDEMPOTENCY_IN_PROGRESS`
- `INTERNAL_ERROR`

---

## 3) Endpoints HTTP

## 3.1 Booking

- `POST /api/bookings/intent`
  - Auth: estudante
  - Idempotencia: obrigatoria
  - Body: `{ "slotId": "<cuid>" }`
- `GET /api/bookings/[id]/status`
  - Auth: estudante dono da reserva
- `POST /api/bookings/[id]/cancel`
  - Auth: estudante dono da reserva
  - Fase 1: sem `Idempotency-Key`; comportamento retry-safe por regra de dominio
- `GET /api/bookings/me`
  - Auth: estudante

## 3.2 Slots / Feed

- `GET /api/slots?date=YYYY-MM-DD`
  - Auth: estudante
- `GET /api/slots/feed`
  - Auth: estudante
  - DTO explicito de transporte (nao espelha loader web acidentalmente)

## 3.3 Wallet

- `POST /api/wallet/deposit`
  - Auth: estudante
  - Idempotencia: obrigatoria
  - Body: `{ "amount": <centavos> }`
- `GET /api/wallet/deposit/[id]/status`
  - Auth: dono da transacao
- `POST /api/wallet/deposit/[id]/cancel`
  - Auth: dono da transacao
  - Regra: apenas deposito pendente
- `GET /api/wallet/me`
  - Auth: estudante
  - Retorna saldo + transacoes (centavos)

## 3.4 Coach (fase 1, escopo controlado)

- `GET /api/coach/slots`
- `POST /api/coach/slots`
- `PATCH /api/coach/slots/[id]`
- `POST /api/coach/slots/[id]/block`
- `POST /api/coach/slots/[id]/unblock`

Todos exigem role `COACH`. Paridade completa da facade legada fica para fase 2.

## 3.5 Perfil / Notificacoes / Push

- `GET /api/me/profile`
- `PATCH /api/me/profile`
- `GET /api/notifications`
- `POST /api/notifications/read`
- `POST /api/notifications/[id]/read`
- `GET /api/notifications/unread-count`
- `POST /api/push/fcm-token`
- `POST /api/push/fcm-token/deactivate`

---

## 4) Exemplos rapidos

## Booking intent (sucesso)

```http
POST /api/bookings/intent
Authorization: Bearer <token>
Idempotency-Key: booking-intent-001
Content-Type: application/json

{ "slotId": "ckslot0100000000000000001" }
```

```json
{
  "data": {
    "bookingId": "ckbook0100000000000000001",
    "paidWithBalance": false
  }
}
```

## Booking intent (idempotency conflict)

```json
{
  "error": {
    "code": "IDEMPOTENCY_KEY_CONFLICT",
    "message": "Idempotency-Key ja foi usado com payload diferente."
  }
}
```

## Slots feed (shape base)

```json
{
  "data": {
    "feedVersion": "v1",
    "serverNowISO": "2026-04-08T12:00:00.000Z",
    "userName": "Joao",
    "balanceCents": 1000,
    "nextClasses": [],
    "availableClasses": [],
    "unavailability": null
  }
}
```

---

## 5) Compatibilidade web (nao negociavel)

- O app web atual continua cliente de primeira classe durante a migracao.
- Server Actions existentes continuam funcionando com os contratos atuais.
- `revalidatePath` e side-effects de UI permanecem isolados em adapters web.
- Regras de dominio/financeiras nao mudam por causa do novo transporte HTTP.

---

## 6) Rotas HTTP legadas/externas que continuam ativas

### Autenticacao

- `ALL /api/auth/[...all]`

### Webhook AbacatePay

- `POST /api/webhooks/abacatepay`

### Cron (Bearer `CRON_SECRET`)

- `GET /api/cron/cleanup-expired`
- `GET /api/cron/reconcile-payments`
- `GET /api/cron/process-pending-refunds`
- `GET /api/cron/close-stale-refund-cases`
- `GET /api/cron/dispatch-pending-notifications`
- `GET /api/cron/maintenance`

---

## 7) Referencias

- [Arquitetura](./ARCHITECTURE.md)
- [Boundaries da API Layer](./API_LAYER_BOUNDARIES.md)
- [Migracao Mobile](./MOBILE_API_MIGRATION.md)
- [Cobertura de Endpoints](./MOBILE_API_ENDPOINT_COVERAGE.md)
- [Modelo de Dominio](./BACKEND_DOMAIN_MODEL.md)
- [Banco de Dados](./DATABASE.md)
- [Seguranca](./SECURITY.md)
