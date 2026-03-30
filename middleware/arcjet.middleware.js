import aj from '../config/arcjet.js';

const arcjetMiddleware = async (req, res, next) => {
    try {

        const decision = await aj.protect(req, {requested : 1} );

        if(decision.isDenied()) {
            if(decision.reason.isRateLimit()) return res.status(429).json({ error: 'Too many requests' });
            if(decision.reason.isBot()) return res.status(403).json({ error: 'Bots are not allowed' });
            if(decision.reason.isShield()) return res.status(403).json({ error: 'Request blocked by Arcjet Shield' });
            if(decision.reason.isUnknown()) return res.status(403).json({ error: 'Request blocked by Arcjet for unknown reasons' });
            
            return res.status(403).json({ error: 'Request blocked by Arcjet' });    

        } else {
            next();
        }
    } catch (error) {
        console.error('Arcjet middleware error:', error);
        next(error);    
    }
};

export default arcjetMiddleware;