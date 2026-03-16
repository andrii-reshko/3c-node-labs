#!/bin/bash

out_file="listing.md"
> "$out_file"

find . \
    \( -name "node_modules" -o -name ".git" -o -name ".idea" -o -name "framework_technology_2026" \) -prune \
    -o -type f \
    -not -name "*.sh" \
    -not -name "*.md" \
    -not -name "package-lock.json" \
    -not -name ".*" \
    -print | sort | while read -r file; do
        display_name="${file#./}"
        echo "### $display_name" >> "$out_file"
        echo "" >> "$out_file"

        ext="${display_name##*.}"
        if [ "$ext" = "$display_name" ]; then
            ext=""
        fi
        
        echo "\`\`\`$ext" >> "$out_file"
        cat "$file" >> "$out_file"
        echo "" >> "$out_file"
        echo "\`\`\`" >> "$out_file"
        echo "" >> "$out_file"
done

echo "Done"
