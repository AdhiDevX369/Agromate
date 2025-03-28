# Farmer Data Management System (FDMS)

## Database Schema

### Tables

1. **Farmer**
  - ID (Primary Key)
  - FullName
  - NIC (National ID Card)
  - DOB (Date of Birth)
  - Gender
  - Address
  - Email
  - Province
  - District
  - VillageDivision
  - PhoneNumber
  - Password
  - IsGovernmentEmployee (Boolean)
  - SalaryExceeds40k (Boolean)
  - EligibleForSubsidies (Boolean) - *Calculated: FALSE if IsGovernmentEmployee=TRUE OR SalaryExceeds40k=TRUE*

2. **Crop**
  - CropID (Primary Key)
  - FarmerID (Foreign Key)
  - CropName
  - CropCategory (Grains, Fruits, Cash Crops, Spices)
  - Season
  - SowingDate
  - ExpectedHarvestDate

3. **Land**
  - LandID (Primary Key)
  - FarmerID (Foreign Key)
  - Location
  - AreaUsed (hectares/acres)

4. **Cultivation**
  - CultivationID (Primary Key)
  - CropID (Foreign Key)
  - FarmingType
  - IrrigationMethod (Drip, Sprinkler, Rain-fed)
  - FertilizerMethod (Organic, Inorganic, Mixed)
  - PesticidesUsed

5. **Finance**
  - FinanceID (Primary Key)
  - FarmerID (Foreign Key)
  - CropID (Foreign Key)
  - Income
  - CropScale
  - MoneySubsidies
  - FertilizerSubsidies
  - LoanAmount
  - OtherIncome
  - SeedCost
  - FertilizerCost
  - LaborCost
  - TransportationCost
  - OtherExpenses
  - NetProfit (Calculated field)

## System Features

### 1. Farmer Management
- **Registration**: Collect personal information
- **Eligibility**: Automatic subsidy eligibility calculation
- **Profile Management**: Update farmer details

### 2. Crop Management
- Register multiple crops per farmer
- Categorize crops (Grains, Fruits, Cash Crops, Spices)
- Track growing seasons and harvest dates
- Admin access for CRUD operations on crop master data
- Farmers can:
  - Select existing crops from database
  - Request approval for new crops
  - Avoid duplicate entries through validation

### 3. Land Management
- Register multiple land parcels
- Track land utilization
- Record location and area details

### 4. Cultivation Tracking
- Document farming methods
- Record irrigation techniques
- Track fertilizer and pesticide usage

### 5. Financial Management
- Income tracking
- Expense management
- Subsidy allocation tracking
- Automated profit/loss calculation

### 6. Reporting System
- Generate subsidy eligibility reports
- Analyze crop production data
- Provide financial performance overviews
- Export reports in various formats
