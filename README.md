# crypto-chain-react

Frontend for https://github.com/melder/full_option_chain_scraper

# Deployment (ubuntu)

1. Acquire latest nodejs

```
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Latest version of npm + vite

```
sudo apt install npm
sudo npm install -g npm
sudo apt install vite
```

3. Clone repo

```
git clone git@github.com:melder/full_option_chain_react.git
```

4. Build

```
cd full_option_chain_react
npm run build
```

5. Config

Update .env.production file to point to the Flask API

VITE_CRYPTO_CHAINS_API_URL=http://your-domain/chains_api

6. nginx

I run multiple apps on multiple reverse proxies with a single config file. This is one way to skin the cat

```
sudo su # prefer to do all this as superuser, be careful
cd /etc/nginx
nano sites-avialable/prod.conf

# create / update your prod.conf as you see fit

ln -s /etc/nginx/sites-available/prod.conf /etc/^Cinx/sites-enabled/prod.conf

# test
nginx -t

systemctl stop nginx
systemctl start nginx
```

#### prod.conf

```
server {
    listen 80;
    server_name <domain>;

    location /chains_api/ {
        include proxy_params;
        proxy_pass http://unix:/home/user/full_option_chain_scraper/chains_api.sock:/;
    }

    location /chains/ {
        include proxy_params;
        proxy_pass http://unix:/home/user/full_option_chain_react/chains.sock:/;
    }
}
```
