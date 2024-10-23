//URLに含まれる危険文字を無害化
export const dangerousCharToSpace = (str:string) => {
    if (!str) return "";
    return str.replace(/[<>&"'`;　=\%]/g, function (match) {
        const escape: { [key: string]: string } = {
            '<': ' ',
            '>': ' ',
            '&': ' ',
            '"': ' ',
            "'": ' ',
            '`': ' ',
            ';': ' ',
            '　': ' ',
            '=': ' ',
            '%': ' ',
        };
        return escape[match];
    });    
  }

//汎用的なXSS対策
export const validationForWord = (str:string,limit:number=20): {result:boolean, message:string} => {
    // 長さ1～20の範囲
    if (str.length===0 || str.length>limit) return {result:false, message:`1～${limit}字以内の文字列を入力して下さい`}
	//htmlエンティティ
	const pattern = /[<>%"`';?&=]/;
	if(pattern.test(str))return{result:false, message:'「<>%"`\';?&=」これらの文字列は使用不可です'};
    // 成功!!
    return {result:true,message:'success'}
}

//メールアドレスのバリデーション
export const validationForEmail = (str:string): {result:boolean, message:string} => {
    //長さ1～20の範囲
    if(str.length===0 || str.length>40)return {result:false, message:'1～40字以内のメールアドレを入力して下さい'};
    //email形式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const result = emailRegex.test(str);
    if(!result)return {result:false, message:'有効なメールアドレスの形式でありません'};
    // 成功!!
    return {result:true,message:'success'}
}

//パスワードのバリデーション
export const validationForPassword = (str:string): {result:boolean, message:string} => {
    //長さ5～50の範囲
    if(str.length<5 || str.length>50)return {result:false, message:'5～50字以内の半角の英数字を入力して下さい'};
    //email形式
    const passwordRegex = /^[A-Za-z0-9]+$/;
    const result = passwordRegex.test(str);
    if(!result)return {result:false, message:'半角の英数字で入力して下さい'};
    // 成功!!
    return {result:true,message:'success'}
}

//authenticationPassword(6桁の数字)
export const validationForAuthenticationPassword = (str:string): {result:boolean, message:string} => {
    //6桁
    if(str.length!==6)return {result:false, message:'6桁の半角数字を入力して下さい'};
    //半角数字
    const passwordRegex = /^[0-9]+$/;
    const result = passwordRegex.test(str);
    if(!result)return {result:false, message:'半角数字で入力して下さい'};
    // 成功!!
    return {result:true,message:'success'}
}
