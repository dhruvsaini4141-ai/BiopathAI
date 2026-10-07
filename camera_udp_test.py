import socket
import time

CAMERA_IP = "192.168.10.123"

# Candidate UDP ports used by similar iTiMO/Molink cameras.
PORTS = [
    80,
    8000,
    8001,
    8080,
    8031,
    8554,
    8899,
    9000,
    10000,
    10001,
    10002,
    10003,
    10004,
]


def test_udp_port(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(1.0)

    try:
        # Known iTiMO-style discovery/control request.
        # We send it and wait for an actual response.
        message = b"type=1002"

        print(f"Testing UDP {port} ...")

        sock.sendto(message, (CAMERA_IP, port))

        start = time.time()

        while time.time() - start < 1.0:
            try:
                data, address = sock.recvfrom(65535)

                print()
                print("  >>> RESPONSE RECEIVED <<<")
                print(f"  From: {address}")
                print(f"  Bytes: {len(data)}")
                print(f"  Raw: {data[:200]!r}")

                return True

            except socket.timeout:
                break

    except Exception as e:
        print(f"  Error: {e}")

    finally:
        sock.close()

    return False


def main():
    print("=" * 60)
    print("BIOPATCH AI - iTiMO UDP DISCOVERY TEST")
    print("=" * 60)
    print()
    print("SSID:      iTiMO-725530")
    print(f"Camera IP: {CAMERA_IP}")
    print()
    print("Keep the camera powered ON.")
    print("The iTiMO phone app should be CLOSED for this test.")
    print()

    responses = []

    for port in PORTS:
        if test_udp_port(port):
            responses.append(port)

        time.sleep(0.2)

    print()
    print("=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

    if responses:
        print()
        print("UDP ports that returned a response:")
        for port in responses:
            print(f"  UDP {port}")
    else:
        print()
        print("No response received from the tested UDP ports.")

    print()


if __name__ == "__main__":
    main()