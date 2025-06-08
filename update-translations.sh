#!/usr/bin/env sh

cd src/

tmp=po/temporary.pot
pot=po/wol@mnorlin.se.pot

xgettext ./*.js -o "$tmp" --no-wrap --from-code UTF-8
xgettext -j ./**/*.js -o "$tmp" --no-wrap --from-code UTF-8
xgettext -j schemas/*.xml -o "$tmp" --no-wrap --from-code UTF-8

msgmerge --backup=off -U "$pot" "$tmp"

rm $tmp

for po in po/*; do
    msgmerge --backup=off -U "$po" "$pot"
done

