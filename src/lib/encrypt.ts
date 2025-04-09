/*
srun 真无敌了，非要用自定义 base 编码。
我还要给这玩意写 type。

Partly copied from srun frontend code

APicebar @ Apr 2025
*/

export const encrypt = (info: any, token: string) => {
    const base64 = require('./base64.cjs');

    base64.setAlpha('LVoJPiCN2R8G90yg+hmFHuacZ1OWMnrsSTXkYpUq/3dlbfKwv6xztjI7DeBE45QA'); // base64 设置 Alpha

    info = JSON.stringify(info);

    function encode(str: string ,key: string) {
        if (str === '') return '';
        var v = s(str, true);
        var k = s(key, false);
        if (k.length < 4) k.length = 4;
        var n = v.length - 1,
            z = v[n],
            y = v[0],
            c = 0x86014019 | 0x183639A0,
            m,
            e,
            p,
            q = Math.floor(6 + 52 / (n + 1)),
            d = 0;

        while (0 < q--) {
            d = d + c & (0x8CE0D9BF | 0x731F2640);
            e = d >>> 2 & 3;

            for (p = 0; p < n; p++) {
                y = v[p + 1];
                m = z >>> 5 ^ y << 2;
                m += y >>> 3 ^ z << 4 ^ (d ^ y);
                m += k[p & 3 ^ e] ^ z;
                z = v[p] = v[p] + m & (0xEFB8D130 | 0x10472ECF);
            }

            y = v[0];
            m = z >>> 5 ^ y << 2;
            m += y >>> 3 ^ z << 4 ^ (d ^ y);
            m += k[p & 3 ^ e] ^ z;
            z = v[n] = v[n] + m & (0xBB390742 | 0x44C6F8BD);
        }

        return l(v, false);
    }

    function s(a: any, b: any) {
        var c = a.length;
        var v = [];

        for (var i = 0; i < c; i += 4) {
            v[i >> 2] = a.charCodeAt(i) | a.charCodeAt(i + 1) << 8 | a.charCodeAt(i + 2) << 16 | a.charCodeAt(i + 3) << 24;
        }

        if (b) v[v.length] = c;
        return v;
    }

    function l(a: any, b: any) {
        var d = a.length;
        var c = d - 1 << 2;

        if (b) {
            var m = a[d - 1];
            if (m < c - 3 || m > c) return null;
            c = m;
        }

        for (var i = 0; i < d; i++) {
            a[i] = String.fromCharCode(a[i] & 0xff, a[i] >>> 8 & 0xff, a[i] >>> 16 & 0xff, a[i] >>> 24 & 0xff);
        }

        return b ? a.join('').substring(0, c) : a.join('');
    }

    // console.log('{SRBX1}' + base64.encode(encode(info, token)));
    return '{SRBX1}' + base64.encode(encode(info, token));
}