from botocore.exceptions import ClientError
import boto3
import json


def get_linux_ec2_private_ip():
    """Get the private IP Address of the machine if running on an EC2 linux server"""
    from urllib.request import urlopen
    try:
        response = urlopen('http://169.254.169.254/latest/meta-data/local-ipv4')
        return response.read().decode("utf-8")
    except:
        return None
    finally:
        if response:
            response.close()


def get_region():
    from urllib.request import urlopen
    try:
        response = urlopen('http://169.254.169.254/latest/meta-data/placement/region')
        return response.read().decode("utf-8")
    except:
        return None
    finally:
        if response:
            response.close()


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