# Intrusion-Detection-System
## Abstract
This project aims to develop a comprehensive Intrusion Detection System (IDS) using an STM32 microcontroller and an ESP Wi-Fi module. The system is designed to monitor network traffic, detect potential security threats, and log alerts using AWS cloud services. The IDS employs both signature-based and anomaly-based detection methods to identify suspicious activities.

The signature-based detection compares captured network packets against a predefined database of known attack patterns. Anomaly-based detection establishes a baseline of normal network behavior and flags deviations as potential threats. The ESP Wi-Fi module connects the STM32 to a network, capturing traffic and transmitting data to AWS IoT Core.

AWS IoT Core forwards the data to an AWS Lambda function, which processes the incoming messages. The Lambda function logs the data to Amazon CloudWatch for monitoring and analysis and sends alerts via Amazon SNS (Simple Notification Service) to configured endpoints such as email or SMS.

The project encompasses hardware setup, firmware development, and AWS configuration. The system is rigorously tested with simulated normal and malicious traffic to validate its accuracy and reliability. The final deliverables include a detailed project report, a working demo, and comprehensive documentation of the IDS.

By integrating embedded systems with cloud-based services, this project demonstrates an effective approach to enhancing network security and real-time threat detection.
