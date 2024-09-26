let propertyCount = 0;

function addProperty() {
    propertyCount++;
    const propertyDiv = document.createElement('div');
    propertyDiv.className = 'property';
    propertyDiv.innerHTML = `
        <h2>Property ${propertyCount}</h2>
        <div class="summary" id="summary${propertyCount}"></div>

        <button class="remove-property" onclick="removeProperty(this)">Remove Property</button>
        <div class="input-group">
            <label for="initialValue${propertyCount}">Initial Value ($):</label>
            <input type="number" id="initialValue${propertyCount}" value="384000">
        </div>
        <div class="input-group">
            <label for="downPaymentPercent${propertyCount}">Down Payment (%):</label>
            <input type="number" id="downPaymentPercent${propertyCount}" value="20" step="1">
        </div>
        <div class="input-group">
            <label for="downPaymentAmount${propertyCount}">Down Payment ($):</label>
            <input type="number" id="downPaymentAmount${propertyCount}" value="76800" readonly>
        </div>
        <div class="input-group">
            <label for="amortization${propertyCount}">Amortization (years):</label>
            <input type="number" id="amortization${propertyCount}" value="25">
        </div>
        <div class="input-group">
            <label for="interestRate${propertyCount}">Interest Rate (%):</label>
            <input type="number" id="interestRate${propertyCount}" value="2.9" step="0.1">
        </div>
        <div class="input-group">
            <label for="appreciationRate${propertyCount}">Yearly Appreciation Rate (%):</label>
            <input type="number" id="appreciationRate${propertyCount}" value="2" step="0.1">
        </div>
        <div class="input-group">
            <label for="rentalIncome${propertyCount}">Monthly Rental Income ($):</label>
            <input type="number" id="rentalIncome${propertyCount}" value="2000" step="250">
        </div>
        <div class="input-group">
            <label for="prepayment${propertyCount}">Monthly Prepayment ($):</label>
            <input type="number" id="prepayment${propertyCount}" value="0" step="1000">
        </div>
        <div class="input-group">
            <label for="annualTaxes${propertyCount}">Annual Property Taxes ($):</label>
            <input type="number" id="annualTaxes${propertyCount}" value="700" step="100">
        </div>
        <div class="input-group">
            <label for="taxIncreaseRate${propertyCount}">Annual Tax Increase (%):</label>
            <input type="number" id="taxIncreaseRate${propertyCount}" value="2" step="1">
        </div>
    `;
    document.getElementById('propertiesContainer').appendChild(propertyDiv);
    
    // Attach event listeners for inputs of the newly added property
    const downPaymentPercentInput = document.getElementById(`downPaymentPercent${propertyCount}`);
    downPaymentPercentInput.addEventListener('input', function() {
        const initialValue = parseFloat(document.getElementById(`initialValue${propertyCount}`).value) || 0;
        const percent = parseFloat(this.value) || 0;
        const downPaymentAmount = (initialValue * percent) / 100;
        document.getElementById(`downPaymentAmount${propertyCount}`).value = downPaymentAmount.toFixed(2);
        updateAllSummaries();
    });

    // Attach event listener to all other inputs of the property
    const inputs = propertyDiv.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateAllSummaries);
    });

    updateAllSummaries();
}

function removeProperty(button) {
    button.closest('.property').remove();
    renumberProperties();
    updateAllSummaries();
}

function renumberProperties() {
    const properties = document.querySelectorAll('.property');
    properties.forEach((property, index) => {
        const newIndex = index + 1;
        property.querySelector('h2').textContent = `Property ${newIndex}`;
        property.querySelectorAll('[id]').forEach(element => {
            element.id = element.id.replace(/\d+$/, newIndex);
        });
        property.querySelectorAll('[for]').forEach(element => {
            element.setAttribute('for', element.getAttribute('for').replace(/\d+$/, newIndex));
        });
    });
    propertyCount = properties.length;
}

function attachEventListeners(id) {
    const inputs = document.querySelectorAll(`#initialValue${id}, #downPaymentPercent${id}, #downPaymentAmount${id}, #amortization${id}, #interestRate${id}, #appreciationRate${id}, #rentalIncome${id}, #prepayment${id}, #annualTaxes${id}, #taxIncreaseRate${id}`);
    inputs.forEach(input => {
        input.addEventListener('input', updateAllSummaries);
    });

    const downPaymentPercent = document.getElementById(`downPaymentPercent${id}`);
    const downPaymentAmount = document.getElementById(`downPaymentAmount${id}`);
    const initialValue = document.getElementById(`initialValue${id}`);

    downPaymentPercent.addEventListener('input', () => {
        downPaymentAmount.value = (initialValue.value * downPaymentPercent.value / 100).toFixed(2);
        updateAllSummaries();
    });

    downPaymentAmount.addEventListener('input', () => {
        downPaymentPercent.value = (downPaymentAmount.value / initialValue.value * 100).toFixed(2);
        updateAllSummaries();
    });

    initialValue.addEventListener('input', () => {
        downPaymentAmount.value = (initialValue.value * downPaymentPercent.value / 100).toFixed(2);
        updateAllSummaries();
    });
}

function updateSummary(id) {
    const years = parseInt(document.getElementById('yearSlider').value) || 0;
    const initialValue = parseFloat(document.getElementById(`initialValue${id}`).value) || 0;
    const downPayment = parseFloat(document.getElementById(`downPaymentAmount${id}`).value) || 0;
    const amortization = parseFloat(document.getElementById(`amortization${id}`).value) || 1;
    const interestRate = (parseFloat(document.getElementById(`interestRate${id}`).value) || 0) / 100 / 12;
    const appreciationRate = (parseFloat(document.getElementById(`appreciationRate${id}`).value) || 0) / 100;
    const rentalIncome = parseFloat(document.getElementById(`rentalIncome${id}`).value) || 0;
    const prepayment = parseFloat(document.getElementById(`prepayment${id}`).value) || 0;
    const annualTaxes = parseFloat(document.getElementById(`annualTaxes${id}`).value) || 0;
    const taxIncreaseRate = (parseFloat(document.getElementById(`taxIncreaseRate${id}`).value) || 0) / 100;

    const loanAmount = initialValue - downPayment;
    const monthlyPayment = (loanAmount * interestRate * Math.pow(1 + interestRate, amortization * 12)) / (Math.pow(1 + interestRate, amortization * 12) - 1);

    let remainingBalance = loanAmount;
    let totalInterest = 0;
    let totalRental = 0;
    let totalTaxes = 0;
    let currentValue = initialValue;
    let totalPrincipalPaid = 0;
    let currentAnnualTaxes = annualTaxes;

    if (years > 0) {
        for (let i = 0; i < years * 12; i++) {
            const interestPayment = remainingBalance * interestRate;
            let principalPayment = monthlyPayment - interestPayment;
            
            // Apply prepayment
            principalPayment += prepayment;
            
            totalInterest += interestPayment;
            totalPrincipalPaid += principalPayment;
            remainingBalance -= principalPayment;
            
            if (remainingBalance < 0) {
                totalPrincipalPaid += remainingBalance; // Adjust for overpayment
                remainingBalance = 0;
            }
            
            totalRental += rentalIncome;
            if (i % 12 === 11) {
                currentValue *= (1 + appreciationRate);
                currentAnnualTaxes *= (1 + taxIncreaseRate); // Apply yearly tax increase
            }
            totalTaxes += currentAnnualTaxes / 12; // Convert to monthly
        }
    }

    const summaryDiv = document.getElementById(`summary${id}`);
    summaryDiv.innerHTML = `
        <p>${years > 0 ? `After ${years} year${years > 1 ? 's' : ''}:` : 'Initial values:'}</p>
        <p>Property Value: $${formatNumber(currentValue)}</p>
        <p>Monthly Payment: $${formatNumber(monthlyPayment)}</p>
        ${years > 0 ? `
        <p>Total Principal Built: $${formatNumber(totalPrincipalPaid)}</p>
        <p>Total Interest Paid: $${formatNumber(totalInterest)}</p>
        <p>Total Rental Income: $${formatNumber(totalRental)}</p>
        <p>Total Property Taxes Paid: $${formatNumber(totalTaxes)}</p>
        <p>Current Annual Property Taxes: $${formatNumber(currentAnnualTaxes)}</p>
        ` : ''}
        <p>Remaining Debt: $${formatNumber(remainingBalance)}</p>
    `;

    return {
        currentValue,
        totalPrincipalPaid,
        totalInterest,
        totalRental,
        remainingBalance,
        totalTaxes,
        currentAnnualTaxes
    };
}

function updateAllSummaries() {
    const properties = document.querySelectorAll('.property');
    let totalValue = 0;
    let totalPrincipalPaid = 0;
    let totalInterest = 0;
    let totalRental = 0;
    let totalDebt = 0;
    let totalTaxes = 0;
    let totalCurrentAnnualTaxes = 0;

    properties.forEach((property, index) => {
        const id = index + 1;
        const summary = updateSummary(id);
        totalValue += summary.currentValue;
        totalPrincipalPaid += summary.totalPrincipalPaid;
        totalInterest += summary.totalInterest;
        totalRental += summary.totalRental;
        totalDebt += summary.remainingBalance;
        totalTaxes += summary.totalTaxes;
        totalCurrentAnnualTaxes += summary.currentAnnualTaxes;
    });

    updateTotalSummary(totalValue, totalPrincipalPaid, totalInterest, totalRental, totalDebt, totalTaxes, totalCurrentAnnualTaxes);
}

// Add event listener to the year slider
document.getElementById('yearSlider').addEventListener('input', function() {
    const yearSliderValue = document.getElementById('yearSlider').value;
    
    // Update the text showing the current value of the slider
    document.getElementById('yearValue').textContent = yearSliderValue;
    
    // Recalculate summaries based on the new year value
    updateAllSummaries();
});


function updateTotalSummary(totalValue, totalPrincipalPaid, totalInterest, totalRental, totalDebt, totalTaxes, totalCurrentAnnualTaxes) {
    const totalSummaryDiv = document.getElementById('totalSummary');
    
    // Calculate equity with total taxes subtracted
    const totalEquity = (totalValue - totalDebt) - totalTaxes;
    
    totalSummaryDiv.innerHTML = `
        <h2>Total Summary</h2>
        <p>Total Property Value: $${formatNumber(totalValue)}</p>
        <p>Total Principal Built: $${formatNumber(totalPrincipalPaid)}</p>
        <p>Total Interest Paid: $${formatNumber(totalInterest)}</p>
        <p>Total Rental Income: $${formatNumber(totalRental)}</p>
        <p>Total Property Taxes Paid: $${formatNumber(totalTaxes)}</p>
        <p>Current Total Annual Property Taxes: $${formatNumber(totalCurrentAnnualTaxes)}</p>
        <p>Total Remaining Debt: $${formatNumber(totalDebt)}</p>
        <p>Total Equity (after taxes): $${formatNumber(totalEquity)}</p>
    `;
}


function formatNumber(number) {
    return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Initial setup
addProperty();
updateAllSummaries();

// Add event listener to year slider
document.getElementById('yearSlider').addEventListener('input', updateAllSummaries);