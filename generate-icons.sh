#!/bin/bash

# Script per generare le icone PWA dal logo SVG
# Richiede ImageMagick per la conversione

LOGO_PATH="public/assets/logo.svg"
ICONS_DIR="public/icons"

# Array con le dimensioni necessarie
sizes=(32 72 96 128 144 152 192 384 512)

echo "Generando icone PWA dal logo SVG..."

# Verifica che ImageMagick sia installato
if ! command -v convert &> /dev/null; then
    echo "ImageMagick non è installato. Installalo con:"
    echo "brew install imagemagick"
    exit 1
fi

# Crea la directory icons se non esiste
mkdir -p $ICONS_DIR

# Genera tutte le icone
for size in "${sizes[@]}"; do
    output_file="$ICONS_DIR/icon-${size}x${size}.png"
    echo "Generando $output_file..."
    
    convert -background none -size ${size}x${size} "$LOGO_PATH" "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "✓ Creata icona ${size}x${size}"
    else
        echo "✗ Errore nella creazione dell'icona ${size}x${size}"
    fi
done

echo "Generazione icone completata!"

# Genera anche alcune icone aggiuntive comuni
convert -background none -size 16x16 "$LOGO_PATH" "$ICONS_DIR/favicon-16x16.png"
convert -background none -size 32x32 "$LOGO_PATH" "$ICONS_DIR/favicon-32x32.png"
convert -background none "$LOGO_PATH" -resize 48x48 "$ICONS_DIR/favicon.ico"

echo "✓ Favicon generate"
echo "Tutte le icone PWA sono state generate con successo!"
