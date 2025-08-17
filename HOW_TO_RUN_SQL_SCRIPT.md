# How to Run the Supabase Database Setup Script

## 🎯 Visual Step-by-Step Guide

### Step 1: Open Your File
```
📁 In your project folder, open:
   scripts/setup-supabase-complete.sql
```

### Step 2: Select All Text
```
⌨️  Select everything in the file:
   • Mac: Cmd + A
   • Windows: Ctrl + A
   • You should see ALL text highlighted
```

### Step 3: Copy the Text
```
📋 Copy the selected text:
   • Mac: Cmd + C  
   • Windows: Ctrl + C
```

### Step 4: Open Supabase SQL Editor
```
🌐 Open your Supabase dashboard and navigate to your project's SQL Editor:
   https://supabase.com/dashboard/projects → select your project → SQL → New

📺 You'll see a page that looks like:
   ┌─────────────────────────────────────┐
   │ Supabase SQL Editor                 │
   ├─────────────────────────────────────┤
   │                                     │
   │  [Large empty text box]             │
   │                                     │
   │                                     │
   │                                     │
   ├─────────────────────────────────────┤
   │              [Run] button           │
   └─────────────────────────────────────┘
```

### Step 5: Paste the Script
```
📝 Click in the large text box and paste:
   • Mac: Cmd + V
   • Windows: Ctrl + V
   
✅ You should see lots of SQL code appear
```

### Step 6: Run the Script
```
▶️  Click the "Run" button
   • Usually green or blue colored
   • Located at the bottom of the editor
   
⏳ Wait for completion (30-60 seconds)
```

### Step 7: Check Results
```
✅ Look for success messages like:
   • "Query executed successfully"
   • "Tables created"
   • "Onboard Hero database setup completed successfully!"
   
❌ If you see errors:
   • Red text indicating problems
   • Check if you copied the entire script
   • Try running it again
```

## 🚨 Common Issues

### "Permission denied"
- Make sure you're logged into the correct Supabase account
- Verify you have admin access to the project

### "Syntax error"
- Make sure you copied the ENTIRE script
- Check that no text was cut off at the beginning or end

### "Already exists" errors
- Many statements (e.g., CREATE TABLE/INDEX) use IF NOT EXISTS and are safe to re-run.
- Policies and some grants do not support IF NOT EXISTS. On re-run, you may see errors for existing policies.
- If you need true idempotency for policies, add existence checks (pg_policies) or drop/replace them explicitly.
## ✅ Success Indicators

After running, you should see:
- ✅ Multiple "CREATE TABLE" success messages
- ✅ "CREATE POLICY" success messages  
- ✅ "CREATE INDEX" success messages
- ✅ Final success message about completion

## 📞 What to Do After Success

1. Go to Database → Tables in Supabase
2. You should see 10+ new tables
3. Each table should have a shield icon (RLS enabled)
4. Test your app authentication

## 🆘 If You Need Help

The script is in: `scripts/setup-supabase-complete.sql`
- It's about 600+ lines of SQL code
- Starts with: `-- Onboard Hero Complete Supabase Database Setup`
- Ends with: `END $$;`

Make sure you copy ALL of it!