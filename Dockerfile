# Render Build Command
apt-get update && apt-get install -y \
wget gnupg ca-certificates xvfb \
fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
libatk1.0-0 libxss1 libnss3 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
&& wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
&& apt-get install -y ./google-chrome-stable_current_amd64.deb \
&& rm google-chrome-stable_current_amd64.deb \
&& apt-get clean && rm -rf /var/lib/apt/lists/* && \
npx playwright install-deps && npm install && npx playwright install chrome

# Render Start Command
rm -f /tmp/.X99-lock && Xvfb :99 -screen 0 1024x768x24 & export DISPLAY=:99 && npm start