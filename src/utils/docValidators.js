export const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 | !!cpf.match(/(\d)\1{10}/)) return false;

    const digits = cpf.split('').map(Number);

    const validator = (length) => {
        let sum = 0;
        for (let i = 1; i <= length; i++) {
            sum += digits[i - 1] * (length + 2 - i);
        }
        let rest = (sum * 10) % 11;
        return rest === 10 || rest === 11 ? 0 : rest;
    };

    return validator(9) === digits[9] && validator(10) === digits[10];
};

export const validateCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;

    const size = cnpj.length - 2;
    const numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    
    const calc = (s) => {
        let sum = 0;
        let pos = s.length - 7;
        for (let i = s.length; i >= 1; i--) {
            sum += s.charAt(s.length - i) * pos--;
            if (pos < 2) pos = 9;
        }
        let res = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        return res;
    };

    const digit1 = calc(numbers);
    const digit2 = calc(numbers + digit1);

    return digit1 === Number(digits[0]) && digit2 === Number(digits[1]);
};