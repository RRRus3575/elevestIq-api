## 🧩 Опис моделі даних в Prisma

---

### 👤 `User` — Користувач
- Може бути **стартапом** або **інвестором** (`role`)
- Поля: `email`, `password`, `name`, `role`, `token`, `isOnboarded`
- Зв’язки:
  - 1–1 з `StartupProfile` (для стартапів)
  - 1–1 з `InvestorProfile` (для інвесторів)
  - 1–N з `Agreement` — створені угоди
  - 1–N з `Signature` — як підписант
  - 1–N з `Message` — як відправник або одержувач
  - 1–N з `Session` — refresh-сесії.
  - 1–N з `UserToken` — одноразові токени (verify/reset тощо)

---

### 🔐 `Session` — Refresh-сесія
- Зберігає хеш refresh-токена та метадані пристрою.
- Поля:
  - userId, refreshHash, userAgent?, ip?, createdAt, expiresAt, revokedAt?
- Зв’язок:
  - N–1 до User (з onDelete: Cascade)

---

### 🎟️ `UserToken` — Одноразові дії (verify/reset/login)
- Токени зберігаються у вигляді SHA-256 tokenHash.
- Поля: userId, tokenHash, type, meta?, expiresAt, usedAt?, createdAt
- Типи (TokenType): password_reset, email_verify, email_change, login_verify
Зв’язок:
- N–1 до User (з onDelete: Cascade)

---

### 🧑‍💼 `StartupProfile` — Профіль стартапу
- Прив’язаний до `User` з роллю `STARTUP`
- Поля:
  - `companyName`, `description`, `goals`
  - `tags[]`, `industry`, `stage`, `location`

---

### 💰 `InvestorProfile` — Профіль інвестора
- Прив’язаний до `User` з роллю `INVESTOR`
- Поля:
  - `companyName`, `description`, `interests`
  - `tags[]`, `region`, `budgetMin`, `budgetMax`

---

### 📄 `AgreementTemplate` — Шаблон угоди
- Готові шаблони юридичних документів (наприклад: SAFE, Term Sheet)
- Поля:
  - `name`, `description`, `content` (HTML/Markdown)

---

### 📑 `Agreement` — Угода
- Створюється користувачем на основі шаблону (`AgreementTemplate`)
- Поля:
  - `filledData` (JSON) — дані, введені в шаблон
  - `status`: `DRAFT`, `SENT`, `SIGNED`, `REJECTED`
  - `pdfUrl` — посилання на згенерований PDF
- Зв’язки:
  - 1–1 `template`
  - 1–N `signatures`

---

### 🖋️ `Signature` — Підпис угоди
- Один запис = підпис одного користувача по одній угоді
- Поля:
  - `userId`, `agreementId`, `signedAt`
  - `signatureHash`, `signedDocumentUrl`
  - `isVerified`, `method`
- Доступні методи підпису (`SignatureMethod`):
  - `CLICK` — клік «Підписати»
  - `DRAW` — рукописний підпис
  - `BANK_ID` — MobileID / BankID
  - `DOCUMENT_UPLOAD` — підписаний файл

---

### 📜 `SignatureLog` — Лог підпису
- Логування всіх дій під час підпису
- Поля:
  - `signatureId`, `timestamp`, `action`
  - `ipAddress`, `userAgent`

---

### 💬 `Message` — Повідомлення
- Приватна комунікація між користувачами
- Поля:
  - `senderId`, `receiverId`, `content`, `type`
  - `isRead`, `timestamp`
- Типи повідомлень (`MessageType`):
  - `TEXT`, `IMAGE`, `FILE`, `LINK`, `VIDEO`

---

### 🔁 Основні зв’язки між моделями
- `User` має один із двох профілів — або `StartupProfile`, або `InvestorProfile`, залежно від обраної ролі під час реєстрації (`role`).
- `User` може створювати багато угод (`Agreement`) — тобто є автором угод.
- `User` може підписувати угоди через модель `Signature`, що реалізує зв’язок багато-до-багатьох між користувачами та угодами.
- `AgreementTemplate` — це шаблон, на основі якого можуть бути створені багаторазові угоди (`Agreement`).
- `Agreement` може мати кілька підписів (`Signature`), наприклад, від стартапу та інвестора.
- `Signature` зберігає свою історію в `SignatureLog` — кожна дія (наприклад, підписання або перевірка) логуються з IP-адресою та user-agent.
- `User` може надсилати повідомлення іншому `User` через `Message`, що реалізує приватний чат між стартапом та інвестором.
- `User` ↔ `Session`: 1–N refresh-сесії.
- `User` ↔ `UserToken`: 1–N одноразові токени.


---

### 📦 Enum-и

#### `Role`
- `STARTUP`
- `INVESTOR`

#### `AgreementStatus`
- `DRAFT`
- `SENT`
- `SIGNED`
- `REJECTED`

#### `SignatureMethod`
- `CLICK`
- `DRAW`
- `BANK_ID`
- `DOCUMENT_UPLOAD`

#### `MessageType`
- `TEXT`
- `IMAGE`
- `FILE`
- `LINK`
- `VIDEO`

### `TokenType`
- `password_reset`
- `email_verify`
- `email_change`
- `login_verify`

---
