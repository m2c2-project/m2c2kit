echo This will create a new starter m2c2kit cognitive task.
echo "Choose a script name (no dashes or spaces; must begin with letter)."
echo This will also be the folder name.
echo -n "Name: "
read new_folder_name

new_folder_path="$(pwd)/$new_folder_name"

if [ -d "$new_folder_path" ]; then
    echo -n "Folder $new_folder_path exists. Overwrite files? (y/N): "
    read overwrite
    if [[ "$overwrite" != 'y' && "$overwrite" != 'Y' ]]; then
        echo
        echo Press enter to exit
        read s
        exit 0
    fi
fi

mkdir -p $new_folder_path

# add this new folder to gitignore so git pulls of the library can proceed
cat << EOF > $new_folder_path/.gitignore
*
EOF

mkdir -p "$new_folder_path/.vscode"

# copy starter template files and rename
cp tools/starter-template/* $new_folder_path
mv "$new_folder_path/starter.ts" "$new_folder_path/$new_folder_name.ts"
mv "$new_folder_path/rollup.starter.config.js" "$new_folder_path/rollup.$new_folder_name.config.js"
mv "$new_folder_path/launch.json" "$new_folder_path/.vscode/launch.json"

# change contents of templates to reflect the provided name
sed -i "s/__NAME__/$new_folder_name/g" "$new_folder_path/index.html"
sed -i "s/__NAME__/$new_folder_name/g" "$new_folder_path/rollup.$new_folder_name.config.js"
sed -i "s/__FOLDER__/$new_folder_name/g" "$new_folder_path/rollup.$new_folder_name.config.js"
sed -i "s/__FOLDER__/$new_folder_name/g" "$new_folder_path/.vscode/launch.json"
sed -i "s/__NAME__/$new_folder_name/g" "$new_folder_path/serve.sh"
chmod +x "$new_folder_path/serve.sh"

# add new folder as a workspace
sed -i "s/\"folders\": \[/\"folders\": \[ \{ \"path\": \"$new_folder_name\" \},/g" m2c2kit.code-workspace

# copy wasm binary
cp node_modules/canvaskit-wasm/bin/canvaskit.wasm $new_folder_path

echo Created starter task in $new_folder_path
echo To begin:
echo "  cd $new_folder_path"
echo "  serve.sh"
echo 
echo If successful, you will see a message similar to, \"created task1\task1.bundle.js in 37.5s\"
echo To run the task, open web browser to http://localhost:3000
echo
echo Press enter to exit
read s
