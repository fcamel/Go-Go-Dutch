# Go-Go-Dutch

Demo
----
![Example usage of Go-Go-Dutch](https://raw.githubusercontent.com/fcamel/screenshots/master/go-go-dutch/demo.gif)


Coding Style
------------
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
----
* Tested on the Android emulator Nexus 5 and the real device LG v20.
* Roughly tested on the iOS emulator and iPhone 7. You may need to set the Development Team. I use a custom path variable DEVELOPMENT_TEAM as the value. Reference https://stackoverflow.com/a/40424891/278456


Misc Issue
----------

iOS
* "config.h not found in mutex.h": See https://github.com/facebook/react-native/issues/14382#issuecomment-313163119
* "error: Can't find 'node' binary to build React Native bundle": See https://stackoverflow.com/a/44494828/278456
