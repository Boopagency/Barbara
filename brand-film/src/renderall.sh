#!/bin/bash
# usage: renderall.sh "<query>" <frames> <prefix>
Q="$1"; N=$2; P=$3
C=$(( (N + 3) / 4 ))
for i in 0 1 2 3; do
  a=$(( i * C )); b=$(( (i + 1) * C )); [ $b -gt $N ] && b=$N
  Q="$Q" EVOUT=/dev/null node render.mjs $a $b ${P}_c$i.mp4 > ${P}_r$i.log 2>&1 &
done
wait
printf "file ${P}_c0.mp4\nfile ${P}_c1.mp4\nfile ${P}_c2.mp4\nfile ${P}_c3.mp4\n" > ${P}_list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i ${P}_list.txt -c copy ${P}_video.mp4
grep -h ERR ${P}_r*.log
