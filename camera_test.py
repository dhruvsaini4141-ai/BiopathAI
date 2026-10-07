import socket
import time

CAMERA_IP = "192.168.10.123"

# Known ports commonly used by Wi-Fi inspection cameras.
# We are testing communication, NOT assuming any one protocol.
PORTS = [
    80,
    81,
    443,
    554,
    8000,
    8001,
    8080,
    8081,
    8554,
    8899,
    9000,
    10000,
    10001,
    10002,
    10003,
    10004,
]


def test_tcp():
    print("=" * 60)
    print("BIOPATCH AI - iTiMO CAMERA CONNECTION TEST")
    print("=" * 60)

    print(f"Camera Wi-Fi SSID: iTiMO-725530")
    print(f"Camera/device IP:  {CAMERA_IP}")
    print()

    print("STEP 1: PING TEST")
    print("-" * 60)

    # Python-level connectivity test
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)

    try:
        # This does NOT establish a useful TCP connection.
        # It is only used to check whether the IP is reachable
        # through a TCP attempt.
        sock.connect((CAMERA_IP, 80))
        print("TCP port 80 is OPEN")
    except ConnectionRefusedError:
        print("Device reachable, but TCP port 80 is CLOSED")
    except socket.timeout:
        print("TCP port 80 timed out")
    except Exception as e:
        print(f"TCP test error: {e}")
    finally:
        sock.close()

    print()
    print("STEP 2: TEST COMMON TCP PORTS")
    print("-" * 60)

    open_ports = []

    for port in PORTS:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5)

        try:
            result = sock.connect_ex((CAMERA_IP, port))

            if result == 0:
                print(f"OPEN   TCP {port}")
                open_ports.append(port)
            else:
                print(f"CLOSED TCP {port}")

        except Exception:
            print(f"ERROR  TCP {port}")

        finally:
            sock.close()

    print()
    print("=" * 60)

    if open_ports:
        print("OPEN TCP PORTS:")
        print(open_ports)
    else:
        print("NO COMMON TCP PORTS FOUND")

    print("=" * 60)
    print()
    print("Next stage will investigate the camera's UDP protocol.")
    print()


if __name__ == "__main__":
    test_tcp()