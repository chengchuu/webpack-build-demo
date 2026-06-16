import sha1 from "sha1";

const params = "key=secret&value=obfuscator";
const sign = sha1(params);

console.log(`params: ${params}`);
console.log(`sign: ${sign}`);
