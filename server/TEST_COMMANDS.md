# Quick Test Commands

## Prerequisites

Make sure your server is running on `http://localhost:5000`

## Authentication

### 1. Register Admin

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\": \"admin@guruji.com\", \"password\": \"admin123\"}"
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\": \"admin@guruji.com\", \"password\": \"admin123\"}"
```

### 3. Get Current User (Replace YOUR_TOKEN with accessToken from login)

```bash
curl -X GET http://localhost:5000/api/auth/me -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Refresh Token (Replace YOUR_REFRESH_TOKEN with refreshToken from login)

```bash
curl -X POST http://localhost:5000/api/auth/refresh -H "Content-Type: application/json" -d "{\"refreshToken\": \"YOUR_REFRESH_TOKEN\"}"
```

### 5. Logout (Replace YOUR_TOKEN with accessToken from login)

```bash
curl -X POST http://localhost:5000/api/auth/logout -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Serial Numbers API

### 1. Get All Serial Numbers (Replace YOUR_TOKEN with accessToken)

```bash
curl -X GET http://localhost:5000/api/serial-numbers -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Specific Serial Number (Replace YOUR_TOKEN and TYPE)

```bash
curl -X GET http://localhost:5000/api/serial-numbers/quotation -H "Authorization: Bearer YOUR_TOKEN"
curl -X GET http://localhost:5000/api/serial-numbers/billing -H "Authorization: Bearer YOUR_TOKEN"
curl -X GET http://localhost:5000/api/serial-numbers/challan -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Create/Initialize Serial Numbers (Replace YOUR_TOKEN)

**Create all at once:**

```bash
curl -X POST http://localhost:5000/api/serial-numbers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"quotation\": 0, \"billing\": 0, \"challan\": 0}"
```

**Create individual serial number:**

```bash
# Create quotation
curl -X POST http://localhost:5000/api/serial-numbers/quotation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"currentNumber\": 0}"

# Create billing
curl -X POST http://localhost:5000/api/serial-numbers/billing \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"currentNumber\": 0}"

# Create challan
curl -X POST http://localhost:5000/api/serial-numbers/challan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"currentNumber\": 0}"
```

### 4. Increment Serial Number (Replace YOUR_TOKEN)

```bash
# Increment quotation
curl -X POST http://localhost:5000/api/serial-numbers/quotation/increment -H "Authorization: Bearer YOUR_TOKEN"

# Increment billing
curl -X POST http://localhost:5000/api/serial-numbers/billing/increment -H "Authorization: Bearer YOUR_TOKEN"

# Increment challan
curl -X POST http://localhost:5000/api/serial-numbers/challan/increment -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Update Serial Number (Admin - Replace YOUR_TOKEN and NUMBER)

```bash
curl -X PUT http://localhost:5000/api/serial-numbers/quotation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"currentNumber\": 100}"
```
