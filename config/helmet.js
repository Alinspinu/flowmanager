const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.2/font/bootstrap-icons.css",
    "https://kit-free.fontawesome.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const fontSrcUrls = [
    "https://fonts.googleapis.com/",
    "https://fonts.gstatic.com",
    "https://cdn.jsdelivr.net",
];

const helmetConfig = {
    directives: {
        defaultSrc: [],
        mediaSrc: ["https://res.cloudinary.com/"],
        connectSrc: [
            "http://localhost:3000",
            "https://www.flowmanager.ro",
            "https://localhost:3000"
        ],
        formAction: ["'self'", "https://checkout.stripe.com"],
        scriptSrcAttr: ["'unsafe-inline'"],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        frameSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://www.youtube.com",
            "https://js.stripe.com",
            "https://www.facebook.com",
        ],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dhetxk68c/",
            "https://images.unsplash.com/",
            "https://q.stripe.com",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
};

module.exports = helmetConfig;
