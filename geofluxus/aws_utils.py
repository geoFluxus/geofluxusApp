from botocore.exceptions import ClientError
import boto3
from botocore.utils import InstanceMetadataRegionFetcher
import requests


def get_token():
    """Set the autorization token to live for 6 hours (maximum)"""
    headers = {
        'X-aws-ec2-metadata-token-ttl-seconds': '21600',
    }
    response = requests.put('http://169.254.169.254/latest/api/token', headers=headers)
    return response.text


def get_linux_ec2_private_ip():
    """
    Get the private IP Address of the machine if running on an EC2 linux server.
    See https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html
    """

    # if not is_ec2_linux():
    #     return None
    try:
        token = get_token()
        headers = {
            'X-aws-ec2-metadata-token': f"{token}",
        }
        response = requests.get('http://169.254.169.254/latest/meta-data/local-ipv4', headers=headers)
        return response.text
    except:
        return None
    finally:
        if response:
            response.close()


def get_region():
    region_fetcher = InstanceMetadataRegionFetcher(
        timeout=60, num_attempts=3
    )

    return region_fetcher.retrieve_region()


def get_secret(secret_id, name=None):
    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=get_region()
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_id
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        raise e

    # Decrypts secret using the associated KMS key.
    secret_name = name if name is not None else secret_id
    secret = json.loads(get_secret_value_response['SecretString'])[secret_name]

    return secret