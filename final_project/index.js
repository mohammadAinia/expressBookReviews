const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// تمكين قراءة بيانات JSON من الطلبات
app.use(express.json());

// إعداد الجلسة
app.use("/customer", session({
    secret: "fingerprint_customer", 
    resave: true, 
    saveUninitialized: true
}));

// آلية المصادقة
app.use("/customer/auth/*", function auth(req, res, next) {
    // التحقق من وجود جلسة تحتوي على معلومات المصادقة
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken']; // استخراج رمز الوصول

        // التحقق من صحة الرمز باستخدام JWT
        jwt.verify(token, "fingerprint_customer", (err, user) => {
            if (!err) {
                req.user = user; // تخزين بيانات المستخدم في الطلب
                next(); // السماح بالوصول للنقطة التالية
            } else {
                res.status(403).json({ message: "User not authenticated" }); // رفض الوصول
            }
        });
    } else {
        res.status(403).json({ message: "User not logged in" }); // عدم وجود جلسة صالحة
    }
});

const PORT = 5000;

// توجيه الطلبات إلى نقاط النهاية الخاصة بالمستخدمين المصادق عليهم
app.use("/customer", customer_routes);

// توجيه الطلبات إلى نقاط النهاية العامة
app.use("/", genl_routes);

// بدء تشغيل الخادم
app.listen(PORT, () => console.log("Server is running on port " + PORT));
