

module.exports.isLoggedIn = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Trebuie sa fii logat')
        return res.redirect('/');
    }
    next();
}

module.exports.isAdmin = async (req, res, next) => {
    if (req.session.userAdmin !== 1) {
        req.flash('error', 'Trebuie să fii Admin')
        return res.redirect('/locatie/user/login')
    }
    next()
}

module.exports.isCasier = async (req, res, next) => {
    const admin = parseInt(req.session.userAdmin)
    if (admin === 1 || admin === 0) {

        next()
    } else {
        req.flash('error', "Trebuie să fii Casier sau Admin")
        return res.redirect('back')
    }

}

module.exports.isTva = async (req, res, next) => {
    const platitorTva = req.session.passport.user.platitorTva
    if (platitorTva) {
        next()
    } else {
        req.flash('error', "Nu stiu cu ai ajuns aici dar trebuie sa fii platitor de TVA si tu nu platesti!")
        return res.redirect('back')
    }
}

module.exports.isNotTva = async (req, res, next) => {
    const platitorTva = req.session.passport.user.platitorTva
    if (!platitorTva) {
        next()
    } else {
        req.flash('error', "Nu stiu cu ai ajuns aici dar trebuie sa fii neplatitor de TVA si tu platesti!")
        return res.redirect('back')
    }
}

module.exports.isBarista = async (req, res, next) => {
    const admin = parseInt(req.session.userAdmin)
    if (admin === 1 || admin === 2) {
        next()
    } else {
        req.flash('error', "Trebuie să fii Barista sau Admin")
        return res.redirect('back')
    }
}
module.exports.isBuc = async (req, res, next) => {
    const admin = parseInt(req.session.userAdmin)
    if (admin === 1 || admin === 3) {
        next()
    } else {
        req.flash('error', "Trebuie să fii Bucatar sau Admin")
        return res.redirect('back')
    }
}

module.exports.isUser = async (req, res, next) => {
    if (!req.session.userId || req.session.userId === null) {
        req.flash('error', "Trebuie să fii logat")
        return res.redirect('/locatie/user/login')
    }
    next()
}