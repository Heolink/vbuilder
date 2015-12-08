#vbuilder
Create Vagrantfile and bootrstap.sh in current folder


###Installation
    npm install
    npm link
    
###Usage
    Usage: build [options]
    
      Options:
    
        -h, --help         output usage information
        -v, --verbose      vervbose mode
        -i, --ip <ip>      ip to Vagrant machine default : 192.168.89.29
        -b, --box <box>    box Vagrant default : ubuntu/trusty64
        -h, --host <host>  install apache2 with virtualhost
        -m, --mysql        install mysql
        -c, --composer     install composer
        -n, --node         install node
        -r, --redis        install redis
        -g, --git          install git
        -b, --bower        install bower, if use install node
        -G, --gulp         install gulp, if use install node
        -t, --test         test mode, no save file
        -A, --all          use all options

###Example
    //minimal
    vbuilder build
    
    //with apache2/php5 and virtualhost site.com
    vbuilder build -h site.com
    
    //with all option and vhost
    vbuilder build -A -h site.com
    

    