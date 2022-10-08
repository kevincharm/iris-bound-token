.PHONY: publish

publish-dry-run:
	@echo ⚠️ Publishing to npm!
	@echo Enter your OTP:
	read -r otp; npm publish --dry-run --otp $$otp

publish:
	@echo ⚠️ Publishing to npm!
	@echo Enter your OTP:
	read -r otp; npm publish --otp $$otp
