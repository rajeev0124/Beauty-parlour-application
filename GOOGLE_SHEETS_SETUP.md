# 📊 Google Sheets Live-Sync Guide for Sindhura Makeovers

You can manage all Services and Products directly from a free Google Sheet on your mobile phone or laptop. Any changes you make will update on your website live!

---

## 🚀 3 Simple Steps to Connect Your Google Sheet

### Step 1: Create a Google Sheet
Create a new Google Spreadsheet with two tabs named **`Services`** and **`Products`**.

#### Tab 1: `Services` (Column Headers in Row 1)
| id | name | category | price | duration | description | popular | image | isActive |
|---|---|---|---|---|---|---|---|---|
| s1 | Hair Cut – Women | hair | 500 | 45 | Professional haircut tailored to your face shape | true | https://images.unsplash.com/... | true |
| s2 | Gold Facial | skin | 1500 | 60 | 24K colloidal gold royal facial treatment | true | https://images.unsplash.com/... | true |
| s3 | Bridal Makeup | bridal | 15000 | 120 | HD waterproof bridal makeover with lashes | true | https://images.unsplash.com/... | true |

#### Tab 2: `Products` (Column Headers in Row 1)
| id | name | category | price | originalPrice | stock | rating | bestseller | image | description | isActive |
|---|---|---|---|---|---|---|---|---|---|---|
| p1 | Keratin Shampoo | hair | 650 | 800 | 25 | 4.8 | true | /products/keratin-shampoo.png | Sulfate-free bio-keratin restorative shampoo | true |
| p2 | Hyaluronic Moisturizer | skin | 890 | 1100 | 15 | 4.9 | true | /products/hyaluronic-moisturizer.png | 72-hour deep cellular moisture cream | true |

---

### Step 2: Make the Google Sheet Publicly Viewable
1. In Google Sheets, click the blue **Share** button in the top right.
2. Under *General access*, change from **Restricted** to **"Anyone with the link can view"**.
3. Copy your Sheet ID from the browser URL:
   `https://docs.google.com/spreadsheets/d/`**`YOUR_SHEET_ID_HERE`**`/edit`

---

### Step 3: Paste Your Sheet ID in `environment.ts`
Open `beauty-parlour/src/environments/environment.ts` and set your `googleSheetId`:

```typescript
export const environment = {
  production: true,
  whatsAppNumber: '919876543210', // Your WhatsApp Phone Number
  googleSheetId: 'YOUR_SHEET_ID_HERE', // Paste your Google Sheet ID here
  ...
};
```

That's it! Whenever you add a new service or change a price in Google Sheets, your website updates live automatically!
