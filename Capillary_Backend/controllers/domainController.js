const Domain = require('../models/domainModel'); 

// Create a new domain
exports.createDomain = async (req, res) => {
    try {
        console.log("Create Domain Request:", req.body);
        const domain = new Domain(req.body);
        await domain.save();
        res.status(201).json({ message: 'Domain created successfully', domain });
    } catch (error) {
        console.error("Error creating domain:", error);
        res.status(400).json({ message: error.message });
    }
};

// Read all domains
exports.getAllDomains = async (req, res) => {
    try {
        const domains = await Domain.find();
        res.status(200).json(domains);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read a single domain by ID
exports.getDomainById = async (req, res) => {
    try {
        const domain = await Domain.findOne({ _id: req.params.id });
        if (!domain) return res.status(404).json({ message: 'Domain not found' });
        res.status(200).json(domain);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a domain by ID
exports.updateDomain = async (req, res) => {
    try {
        const domain = await Domain.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            {
                new: true, 
                runValidators: true, 
            }
        );
        if (!domain) return res.status(404).json({ message: 'Domain not found' });
        res.status(200).json({ message: 'Domain updated successfully', domain });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a domain by ID
exports.deleteDomain = async (req, res) => {
    try {
        const domain = await Domain.findOneAndDelete({ _id: req.params.id });
        if (!domain) return res.status(404).json({ message: 'Domain not found' });
        res.status(200).json({ message: 'Domain deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update many domains
exports.updateManyDomains = async (req, res) => {
    try {
        const { filter, update } = req.body;

      
        const result = await Domain.updateMany(filter, update);

   
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No domains matched the filter criteria' });
        }

        res.status(200).json({ message: 'Domains updated successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update domain status by ID
exports.updateDomainStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
  
        const updatedDomain = await Domain.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedDomain) {
            return res.status(404).json({ message: 'Domain not found' });
        }

        res.status(200).json({ message: 'Status updated successfully', domain: updatedDomain });
    } catch (error) {
        console.error('Error updating domain status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
