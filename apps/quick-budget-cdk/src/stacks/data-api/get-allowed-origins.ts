// https://medium.com/life-at-apollo-division/setup-cors-for-amazon-api-gateway-via-aws-cdk-2030f9026b1f
export const getAllowOrigin = (origins: string[]) => {
  const condition = origins
    .map((x) => `$origin.matches("${x}")`)
    .reduce((l, r) => `${l} || ${r}`);

  return `
#set($origin = $input.params("Origin"))
#if($origin == "") #set($origin = $input.params("origin")) #end
#if(${condition})
  #set($context.responseOverride.header.Access-Control-Allow-Origin = $origin)
#end\n`;
};
