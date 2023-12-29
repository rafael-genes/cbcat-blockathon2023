# CBCAT Hackathon

## Prerequisites
Create business on https://act-blockathon.ngrok.app/docs#/Business/BusinessController_

```
curl -X 'POST' \
  'https://act-blockathon.ngrok.app/business/account' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": <adminEmail>
  "businessLegalName": <businessName>
}'
```

With response: 
```json
{
  "email": "string",
  "accountAddress": "string",
  "tokenBalances": [
    {
      "contractAddress": "string",
      "balance": 0,
      "tokenId": "string"
    }
  ]
}
```

Save:
- email: will be used for admin user
- accountAddress: business address 
- contractAddress

TODO: add creation of admin user

## Set up
Install dependencies:
```
npm ci
```

Set up environment variables:
```
cp .env.example .env
```

Db push:
```
npx prisma db push
```

Seed database:
```
npx prisma db seed
```

To view the database with sqlite:
```
sqlite3 ./prisma/dev.db
```


## Run
```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Dashboard: http://localhost:3000/dashboard


