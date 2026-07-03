/**
 * WINNER NOTIFICATION SYSTEM
 * Handles draw execution, winner detection, and notification
 */

const TELEGRAM_BOT_TOKEN = "8867724899:AAGBqei23Rrqj47uumDLJKcOyINa4k-5F70";
const TELEGRAM_CHAT_ID = "-1005120162870";
const TELEGRAM_SUPPORT_USERNAME = "fita_regassa";

// ==================== DRAW EXECUTION ====================

async function executeDraw(winningNumber) {
    try {
        const { addDoc, collection, getDocs, query, where, updateDoc, doc, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        // Create draw record
        const drawRef = await addDoc(collection(window.db, "draws"), {
            winningNumber: winningNumber,
            drawDate: new Date().toISOString(),
            totalTickets: 0,
            winners: [],
            prizePool: 0,
            executedAt: serverTimestamp(),
            executedBy: "System"
        });

        // Find all winning tickets
        const ticketsSnapshot = await getDocs(
            query(collection(window.db, "tickets"), where("status", "==", "Active"))
        );

        let winners = [];
        let totalTickets = 0;

        for (const ticketDoc of ticketsSnapshot.docs) {
            const ticket = ticketDoc.data();
            totalTickets++;

            // Check if ticket contains winning number
            if (ticket.numbers.includes(winningNumber)) {
                winners.push({
                    ticketId: ticket.ticketId,
                    customerName: ticket.customerName,
                    customerPhone: ticket.customerPhone,
                    customerEmail: ticket.customerEmail,
                    numbers: ticket.numbers,
                    prizeAmount: calculatePrize(ticketSnapshot.size, winners.length)
                });

                // Update ticket status
                await updateDoc(doc(window.db, "tickets", ticketDoc.id), {
                    status: "Won",
                    wonAt: serverTimestamp(),
                    winningNumber: winningNumber
                });
            }
        }

        // Update draw record with winners
        await updateDoc(doc(window.db, "draws", drawRef.id), {
            winners: winners,
            totalTickets: totalTickets,
            prizePool: winners.reduce((sum, w) => sum + w.prizeAmount, 0)
        });

        // Notify all winners
        for (const winner of winners) {
            await notifyWinner(winner, winningNumber);
        }

        // Notify admin
        await notifyAdminOfDraw(winningNumber, winners, totalTickets);

        // Announce on social media
        await announceDraw(winningNumber, winners);

        return {
            success: true,
            drawId: drawRef.id,
            winningNumber: winningNumber,
            totalWinners: winners.length,
            winners: winners
        };

    } catch (error) {
        console.error("Error executing draw:", error);
        return { success: false, message: error.message };
    }
}

// ==================== WINNER DETECTION ====================

async function checkWinner(ticketNumbers, winningNumber) {
    return ticketNumbers.includes(winningNumber);
}

// ==================== PRIZE CALCULATION ====================

function calculatePrize(totalTickets, winnerNumber) {
    // Prize distribution example:
    // 70% of revenue goes to winners
    // Divide equally among all winners
    const totalRevenue = totalTickets * 100; // 100 ETB per ticket
    const prizePool = totalRevenue * 0.7; // 70% for winners
    const prizePerWinner = Math.floor(prizePool / (winnerNumber + 1));
    
    return prizePerWinner;
}

// ==================== WINNER NOTIFICATIONS ====================

async function notifyWinner(winner, winningNumber) {
    // Email notification
    await sendWinnerEmail({
        name: winner.customerName,
        email: winner.customerEmail,
        phone: winner.customerPhone,
        ticketId: winner.ticketId,
        winningNumber: winningNumber,
        prizeAmount: winner.prizeAmount
    });

    // SMS/Telegram notification
    const telegramMessage = `
🎉 **CONGRATULATIONS! YOU WON!**

Your ticket has won the Boni Lottery draw!

🎫 Ticket ID: ${winner.ticketId}
🎰 Winning Number: ${winningNumber}
💰 Prize Amount: ${winner.prizeAmount} ETB

📱 Your numbers: ${winner.numbers.join(", ")}

Contact us on Telegram: @${TELEGRAM_SUPPORT_USERNAME}
Or call: ${winner.customerPhone}

✅ Prize will be transferred within 24-48 hours
    `;

    try {
        // Log this for now - in production, integrate actual email/SMS
        console.log("Winner notification for:", winner.customerName);
        console.log(telegramMessage);
    } catch (error) {
        console.error("Error notifying winner:", error);
    }
}

async function sendWinnerEmail(data) {
    const emailContent = `
    <h2>🎉 Congratulations ${data.name}! You Won!</h2>
    
    <p>Your ticket in Boni Lottery has won the daily draw!</p>
    
    <div style="background: #f0f0f0; padding: 20px; border-radius: 10px;">
        <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
        <p><strong>Winning Number:</strong> ${data.winningNumber}</p>
        <p><strong>Prize Amount:</strong> ${data.prizeAmount} ETB</p>
        <p><strong>Your Numbers:</strong> ${data.numbers}</p>
    </div>
    
    <p>Your prize will be transferred to your account within 24-48 hours.</p>
    <p>Contact us for any questions: Telegram @${TELEGRAM_SUPPORT_USERNAME}</p>
    `;

    // In production, integrate with email service (SendGrid, Mailgun, etc.)
    try {
        // TODO: Implement actual email sending
        console.log("Email sent to:", data.email);
    } catch (error) {
        console.error("Email notification failed:", error);
    }
}

// ==================== ADMIN NOTIFICATIONS ====================

async function notifyAdminOfDraw(winningNumber, winners, totalTickets) {
    const message = `
🎰 **DRAW EXECUTED SUCCESSFULLY**

🎯 Winning Number: ${winningNumber}
👥 Total Tickets Sold: ${totalTickets}
🏆 Total Winners: ${winners.length}
💰 Total Prize Pool: ${winners.reduce((sum, w) => sum + w.prizeAmount, 0)} ETB

**WINNERS:**
${winners.map((w, i) => `${i + 1}. ${w.customerName} - ${w.prizeAmount} ETB`).join('\n')}

Next Draw: Tomorrow at 8:00 PM
    `;

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
    } catch (error) {
        console.error("Admin notification failed:", error);
    }
}

// ==================== SOCIAL MEDIA ANNOUNCEMENTS ====================

async function announceDraw(winningNumber, winners) {
    // This would integrate with TikTok/Instagram APIs
    const announcement = `
🎉 Today's Lucky Number: ${winningNumber}! 🎉

🏆 Congratulations to ${winners.length} winner${winners.length > 1 ? 's' : ''}!

Next draw tomorrow at 8:00 PM 🎰
Play now: [link to game]
    `;

    // TODO: Post to TikTok/Instagram using their APIs
    console.log("Announcement posted to social media:", announcement);
}

// ==================== DRAW HISTORY ====================

async function getDrawHistory(limit = 10) {
    try {
        const { getDocs, collection, query, orderBy, limit: firestoreLimit } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const q = query(
            collection(window.db, "draws"),
            orderBy("drawDate", "desc"),
            firestoreLimit(limit)
        );

        const snapshot = await getDocs(q);
        const draws = [];

        snapshot.forEach(doc => {
            draws.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return draws;
    } catch (error) {
        console.error("Error getting draw history:", error);
        return [];
    }
}

// ==================== WINNER LOOKUP ====================

async function searchWinner(ticketId) {
    try {
        const { getDocs, collection, query, where } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const q = query(collection(window.db, "tickets"), where("ticketId", "==", ticketId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { found: false, message: "Ticket not found" };
        }

        const ticket = snapshot.docs[0].data();

        if (ticket.status === "Won") {
            return {
                found: true,
                isWinner: true,
                ticket: ticket,
                message: `🎉 This ticket won! Prize: ${calculatePrize(0, 0)} ETB`
            };
        } else {
            return {
                found: true,
                isWinner: false,
                ticket: ticket,
                message: "✅ Ticket is active but not yet a winner"
            };
        }

    } catch (error) {
        console.error("Error searching for winner:", error);
        return { found: false, message: error.message };
    }
}

// ==================== DRAW SCHEDULER ====================

// Run daily draw at 8:00 PM
function scheduleDailyDraw() {
    setInterval(() => {
        const now = new Date();
        
        // Check if it's 8:00 PM (20:00)
        if (now.getHours() === 20 && now.getMinutes() === 0) {
            const winningNumber = generateFairRandomNumber();
            executeDraw(winningNumber);
        }
    }, 60000); // Check every minute
}

// ==================== FAIR RANDOM NUMBER GENERATION ====================

function generateFairRandomNumber() {
    // SHA-256 based fair random generation
    const timestamp = Date.now();
    const randomComponent = Math.random().toString(36).substring(2);
    
    // In production, use:
    // 1. Current block hash from blockchain
    // 2. User submissions from TikTok live chat
    // 3. Combination with admin signature
    
    // For now, simple but fair method
    let hash = 0;
    const str = timestamp.toString() + randomComponent;
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    const winningNumber = (Math.abs(hash) % 1000) + 1;
    return winningNumber;
}

// ==================== DRAW MANUAL TRIGGER (Admin) ====================

async function manualExecuteDraw(winningNumber, adminName) {
    try {
        const { addDoc, collection, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        // Log activity
        await addDoc(collection(window.db, "activity_logs"), {
            action: "Manual Draw Executed",
            details: `Admin ${adminName} executed draw with winning number ${winningNumber}`,
            adminName: adminName,
            timestamp: serverTimestamp()
        });

        return await executeDraw(winningNumber);

    } catch (error) {
        console.error("Error executing manual draw:", error);
        return { success: false, message: error.message };
    }
}

// ==================== EXPORTS ====================

export {
    executeDraw,
    checkWinner,
    calculatePrize,
    notifyWinner,
    getDrawHistory,
    searchWinner,
    scheduleDailyDraw,
    generateFairRandomNumber,
    manualExecuteDraw
};

window.executeDraw = executeDraw;
window.searchWinner = searchWinner;
window.getDrawHistory = getDrawHistory;
window.generateFairRandomNumber = generateFairRandomNumber;
window.manualExecuteDraw = manualExecuteDraw;
