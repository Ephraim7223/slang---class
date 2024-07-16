import Report from "../models/report.model.js";

export const getReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = await Report.findById(reportId).populate('reporter reportedUser', 'userName email');
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('reporter reportedUser', 'userName email');
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const userId = req.user._id;
        const { reason } = req.body;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (report.reporter.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this report" });
        }

        report.reason = reason || report.reason;
        await report.save();
        res.status(200).json({ message: 'Report updated successfully', report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        await report.remove();
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteYourReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const userId = req.user._id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        if (report.reporter.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this report" });
        }

        await report.remove();
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
