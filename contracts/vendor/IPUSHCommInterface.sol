// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8;

// PUSH Comm Contract Interface
interface IPUSHCommInterface {
    function sendNotification(
        address _channel,
        address _recipient,
        bytes calldata _identity
    ) external;
}
