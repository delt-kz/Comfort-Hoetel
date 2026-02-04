# 📝 ШПАРГАЛКА ДЛЯ ЗАЩИТЫ - Comfort Hoetel

## 🎯 Быстрые ответы на ключевые вопросы

---

### 1️⃣ Как работают сессии в вашем проекте?

**Краткий ответ:**
"Когда пользователь логинится, сервер проверяет пароль через bcrypt. Если верно, создается объект сессии с информацией о пользователе и сохраняется в MongoDB. Сервер генерирует уникальный session ID и отправляет его клиенту в HttpOnly cookie. При каждом запросе браузер автоматически отправляет этот cookie, сервер проверяет session ID и получает данные пользователя из MongoDB. Сессия живет 24 часа или до logout."

**Технические детали:**
- Store: MongoDB (connect-mongo)
- TTL: 24 часа
- Cookie name: sessionId
- Session содержит: user {id, username, role, email, fullName}
- НЕ содержит: password, sensitive data

---

### 2️⃣ Что такое HttpOnly и Secure флаги?

**HttpOnly:**
```javascript
cookie: { httpOnly: true }
```
- Cookie НЕ доступен через JavaScript (document.cookie)
- Защита от XSS атак (воровство cookie через скрипты)
- Браузер автоматически отправляет cookie, но JS не видит

**Secure:**
```javascript
cookie: { secure: process.env.NODE_ENV === 'production' }
```
- Cookie отправляется ТОЛЬКО через HTTPS
- Защита от man-in-the-middle атак
- В development = false (можно тестировать через HTTP)
- В production = true (обязательно HTTPS)

**Дополнительно - SameSite:**
```javascript
cookie: { sameSite: 'strict' }
```
- Cookie НЕ отправляется на cross-site запросы
- Защита от CSRF атак

---

### 3️⃣ В чем разница между Authentication и Authorization?

**Authentication (Аутентификация):**
- **КТО вы есть**
- Проверка личности (login + password)
- Пример: пользователь вводит username/password
- В нашем проекте: `isAuthenticated()` middleware
- Результат: req.session.user создан

**Authorization (Авторизация):**
- **ЧТО вы можете делать**
- Проверка прав и ролей
- Пример: может ли пользователь удалять бронирования
- В нашем проекте: `isAdmin()` middleware
- Результат: проверка req.session.user.role === 'admin'

**Пример из кода:**
```javascript
// Authentication - проверяем залогинен ли
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

// Authorization - проверяем права
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin privileges required' });
}

// Использование
app.post('/api/bookings', isAuthenticated, ...);  // Нужен login
app.delete('/api/users/:id', isAdmin, ...);       // Нужны права admin
```

---

### 4️⃣ Как работает bcrypt?

**Что делает bcrypt:**
1. Генерирует случайную соль (salt)
2. Комбинирует пароль + соль
3. Хеширует через Blowfish алгоритм
4. Повторяет процесс 2^10 раз (10 раундов)
5. Результат: `$2b$10$salt$hash` (60 символов)

**При создании пользователя:**
```javascript
const password = "admin123";
const hash = await bcrypt.hash(password, 10);
// Результат: "$2b$10$N9qo8uLO..."
// Сохраняем в БД ТОЛЬКО hash
```

**При логине:**
```javascript
const inputPassword = "admin123";  // От пользователя
const storedHash = user.password;   // Из БД

const isValid = await bcrypt.compare(inputPassword, storedHash);
// bcrypt извлекает соль из hash и пересчитывает
// true если совпадает, false если нет
```

**Почему безопасно:**
- Необратимое хеширование (нельзя получить пароль из hash)
- Уникальная соль для каждого пароля
- Медленный алгоритм (брутфорс непрактичен)
- Даже одинаковые пароли → разные hash

---

### 5️⃣ Какие write операции защищены?

**Защищенные (require authentication):**
```javascript
✅ POST   /api/bookings        - Create booking
✅ PUT    /api/bookings/:id    - Update booking
✅ DELETE /api/bookings/:id    - Delete booking
✅ POST   /api/contacts        - Create contact
✅ PUT    /api/contacts/:id    - Update contact
✅ DELETE /api/contacts/:id    - Delete contact
```

**НЕ защищенные (public access):**
```javascript
❌ GET /api/bookings          - Read all bookings
❌ GET /api/bookings/:id      - Read single booking
❌ GET /api/contacts          - Read all contacts
```

**Почему READ не защищен:**
- Для демонстрации функционала
- Write операции требуют авторизации по требованию
- В продакшене можно защитить и READ

---

### 6️⃣ Какая валидация реализована?

**Email валидация:**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// john@example.com ✅
// invalid.email ❌
```

**Телефон валидация:**
```javascript
const phoneRegex = /^[\d\s\-\+\(\)]+$/;
// +1-555-123-4567 ✅
// abc123 ❌
```

**Даты валидация:**
```javascript
// Check-in не в прошлом
if (checkInDate < today) {
  return { valid: false, error: 'Check-in cannot be in the past' };
}

// Check-out после check-in
if (checkOutDate <= checkInDate) {
  return { valid: false, error: 'Check-out must be after check-in' };
}
```

**Числа валидация:**
```javascript
// Гости: 1-10
if (guests < 1 || guests > 10) {
  return res.status(400).json({ error: 'Guests must be between 1 and 10' });
}

// Цена: >= 0
if (price < 0) {
  return res.status(400).json({ error: 'Invalid price' });
}
```

---

### 7️⃣ HTTP Status коды в проекте

```javascript
200 OK              - Успешное чтение/обновление
201 Created         - Успешное создание
400 Bad Request     - Невалидные данные (валидация failed)
401 Unauthorized    - Не залогинен (authentication required)
403 Forbidden       - Нет прав (authorization failed)
404 Not Found       - Ресурс не найден
500 Server Error    - Ошибка сервера/БД
```

**Примеры:**
```javascript
// 201 - Создано
res.status(201).json({ message: 'Booking created', id: result.insertedId });

// 401 - Требуется login
res.status(401).json({ error: 'Authentication required' });

// 404 - Не найдено
res.status(404).json({ error: 'Booking not found' });
```

---

### 8️⃣ Сколько полей в основной сущности?

**Bookings - 12 meaningful fields:**
1. roomName - название комнаты
2. roomType - тип комнаты
3. guestName - имя гостя
4. guestEmail - email гостя
5. guestPhone - телефон
6. checkInDate - дата заезда
7. checkOutDate - дата выезда
8. duration - количество ночей (auto-calculated)
9. numberOfGuests - количество гостей
10. totalPrice - общая стоимость
11. specialRequests - особые пожелания
12. status - статус (pending/confirmed/checked-in/completed/cancelled)

**Плюс метаданные:**
- created_at - дата создания
- created_by - кто создал
- updated_at - дата обновления
- updated_by - кто обновил

---

### 9️⃣ Сколько записей в БД?

**Bookings: 25 realistic records**
- Seed script: `node seed-bookings.js`
- Реалистичные данные (имена, даты, комнаты, статусы)
- Разные статусы: confirmed, pending, completed, checked-in
- Total revenue: ~$20,000+

**Users: 2 records**
- Admin: username=admin, password=admin123
- Manager: username=manager, password=manager123
- Пароли хешированы через bcrypt

---

### 🔟 Как демонстрировать CRUD через UI?

**CREATE:**
1. Login: http://localhost:3000/admin
2. Dashboard → "Create New Booking"
3. Fill form → Save
4. Booking appears in table

**READ:**
1. Open dashboard
2. See all bookings in table
3. Use search/filters
4. Click "View" icon

**UPDATE:**
1. Click "Edit" icon (pencil)
2. Modify fields in modal
3. Save
4. Changes reflected in table

**DELETE:**
1. Click "Delete" icon (trash)
2. Confirm deletion
3. Booking removed from table

**Показать защиту:**
1. Logout
2. Try to create/update/delete
3. Show 401 error in Network tab
4. Login again to restore access

---

## 🎯 Ключевые фразы для защиты

**Когда спросят про сессии:**
"Сессии хранятся в MongoDB через connect-mongo, session ID в HttpOnly cookie, TTL 24 часа"

**Когда спросят про безопасность:**
"HttpOnly защищает от XSS, Secure от MITM, bcrypt хеширует пароли с солью, middleware защищает write операции"

**Когда спросят про CRUD:**
"Все операции доступны через Web UI, POST/PUT/DELETE защищены middleware, валидация на сервере и клиенте"

**Когда спросят про данные:**
"25 реалистичных bookings с 12 полями, не generic items а domain-specific entity для отеля"

---

## ✅ Чеклист перед защитой

- [ ] Сервер запущен: `npm start`
- [ ] Пользователи созданы: `node init-users.js`
- [ ] Данные загружены: `node seed-bookings.js`
- [ ] Login работает: admin/admin123
- [ ] CRUD работает через UI
- [ ] Защита работает (logout → 401)
- [ ] Понимаю как работают сессии
- [ ] Понимаю HttpOnly и Secure
- [ ] Понимаю разницу Authentication vs Authorization
- [ ] Могу объяснить bcrypt

---

**🎉 Удачи на защите!**
