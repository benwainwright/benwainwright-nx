import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

export const addDomain = (
  context: Construct,
  id: string,
  api: RestApi,
  domainName: string
) => {
  const hostedZone = HostedZone.fromLookup(context, `${id}-api-hosted-zone`, {
    domainName,
  });

  const prefixedDomainName = `api.${domainName}`;

  const apiCert = new DnsValidatedCertificate(context, `${id}-certificate`, {
    domainName: prefixedDomainName,
    hostedZone,
  });

  const apiDomainName = api.addDomainName(`${id}-api-domain-name`, {
    domainName: prefixedDomainName,
    certificate: apiCert,
  });

  new ARecord(context, `${id}-api-a-record`, {
    zone: hostedZone,
    recordName: prefixedDomainName,
    target: RecordTarget.fromAlias(new ApiGatewayDomain(apiDomainName)),
  });
};
