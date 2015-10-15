# GameNight

#command to put in /etc/rc.local before the 'exit 0' line
su cord -c 'forever start -l /var/www/html/GameNight/forever/forever.log -o /var/www/html/GameNight/forever/output.log -e /var/www/html/GameNight/forever/error.log --minUptime 1000 --spinSleepTime 1000 --append /var/www/html/GameNight/forever/config.json'
