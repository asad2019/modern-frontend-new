import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
    import { Construction } from 'lucide-react';

    const Placeholder = ({ title }) => {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center"
        >
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-4 text-2xl">
                <Construction className="h-8 w-8 text-amber-400" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This page is under construction. Functionality for {title.toLowerCase()} can be added in the next steps.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default Placeholder;