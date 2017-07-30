# Go-Go-Dutch

Coding Style
============
Use prettier to indent codes:

```
$ cat << 'EOF' > .git/hooks/pre-commit
#!/bin/sh
jsfiles=$(git diff --cached --name-only --diff-filter=ACM | grep '\.jsx\?$' | tr '\n' ' ')
[ -z "$jsfiles" ] && exit 0

# Prettify all staged .js files
echo "$jsfiles" | xargs ./node_modules/.bin/prettier --write --single-quote --print-width=100

# Add back the modified/prettified files to staging
echo "$jsfiles" | xargs git add

exit 0
EOF

$ chmod +x .git/hooks/pre-commit
```


Note
====
* Tested on the Android emulator Nexus 5 and the real device LG v20.
* Doesn't work on the iOS. Need to solve some third-party module issues.
