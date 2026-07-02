# Contributing to HMC Simulator

Thank you for your interest in contributing to the HMC Simulator project! 🎉

## How to Contribute

### Reporting Bugs
- Use the GitHub Issues tab
- Describe the bug clearly
- Include steps to reproduce
- Mention your environment (OS, Python version, browser)

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Explain how it would benefit users

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git commit -m "Add: description of your changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Describe what you changed and why
   - Reference any related issues

## Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/hmc-simulator.git
cd hmc-simulator

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the simulator
python backend/app.py
```

## Code Style Guidelines

### Python (Backend)
- Follow PEP 8
- Use meaningful variable names
- Add docstrings to functions
- Keep functions focused and small

### JavaScript (Frontend)
- Use ES6+ features
- Use camelCase for variables
- Add comments for complex logic
- Keep functions pure when possible

### HTML/CSS
- Use semantic HTML
- Follow BEM naming for CSS classes
- Keep styles modular and reusable

## Testing

Before submitting a PR:
- Test all user flows
- Verify the console simulator works correctly
- Check that LPAR creation/management functions properly
- Test on different browsers (Chrome, Firefox, Safari)

## Questions?

Feel free to open an issue for any questions or clarifications!

---

**Made with ❤️ by the HMC Simulator community**