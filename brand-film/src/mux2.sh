# usage: mux2.sh video audio duration out
ffmpeg -y -loglevel error -i "$1" -i "$2" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -r 30 -g 30 -c:a aac -b:a 320k -ar 48000 -movflags +faststart -t "$3" "$4"
