#!/usr/bin/env python3
"""
KidCheck Data Analytics Script
Generate comprehensive reports and visualizations for the child check-in system
"""

import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json
import datetime
from pathlib import Path
import numpy as np

# Set up matplotlib for better plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

DATABASE = 'kidcheck.db'
REPORTS_DIR = Path('reports')

def ensure_reports_dir():
    """Create reports directory if it doesn't exist"""
    REPORTS_DIR.mkdir(exist_ok=True)

def get_data():
    """Load data from database"""
    try:
        conn = sqlite3.connect(DATABASE)
        
        # Load requests data
        requests_df = pd.read_sql_query('''
            SELECT r.*, u.name as parent_name, u.email as parent_email
            FROM requests r
            LEFT JOIN users u ON r.parent_id = u.id
        ''', conn)
        
        # Load users data
        users_df = pd.read_sql_query('SELECT * FROM users', conn)
        
        # Load children data
        children_df = pd.read_sql_query('SELECT * FROM children', conn)
        
        conn.close()
        
        # Convert datetime columns
        if not requests_df.empty:
            requests_df['created_at'] = pd.to_datetime(requests_df['created_at'])
            requests_df['response_time'] = pd.to_datetime(requests_df['response_time'])
            requests_df['updated_at'] = pd.to_datetime(requests_df['updated_at'])
        
        if not users_df.empty:
            users_df['created_at'] = pd.to_datetime(users_df['created_at'])
        
        return requests_df, users_df, children_df
        
    except Exception as e:
        print(f"Error loading data: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def generate_summary_stats(requests_df, users_df, children_df):
    """Generate summary statistics"""
    stats = {
        'total_requests': len(requests_df),
        'total_parents': len(users_df[users_df['user_type'] == 'parent']),
        'total_children': len(children_df),
        'pending_requests': len(requests_df[requests_df['status'] == 'pending']),
        'approved_requests': len(requests_df[requests_df['status'] == 'approved']),
        'rejected_requests': len(requests_df[requests_df['status'] == 'rejected']),
        'checkin_requests': len(requests_df[requests_df['request_type'] == 'checkin']),
        'checkout_requests': len(requests_df[requests_df['request_type'] == 'checkout']),
    }
    
    if not requests_df.empty:
        # Response time analysis
        responded_requests = requests_df[requests_df['response_time'].notna()]
        if not responded_requests.empty:
            response_times = (responded_requests['response_time'] - responded_requests['created_at']).dt.total_seconds() / 60
            stats['avg_response_time_minutes'] = response_times.mean()
            stats['median_response_time_minutes'] = response_times.median()
            stats['max_response_time_minutes'] = response_times.max()
            stats['min_response_time_minutes'] = response_times.min()
        
        # Daily activity
        daily_requests = requests_df.groupby(requests_df['created_at'].dt.date).size()
        stats['avg_daily_requests'] = daily_requests.mean()
        stats['max_daily_requests'] = daily_requests.max()
        
        # Most active parents
        parent_activity = requests_df['parent_name'].value_counts()
        if not parent_activity.empty:
            stats['most_active_parent'] = parent_activity.index[0]
            stats['most_active_parent_requests'] = parent_activity.iloc[0]
    
    return stats

def create_visualizations(requests_df, users_df):
    """Create data visualizations"""
    if requests_df.empty:
        print("No data available for visualizations")
        return
    
    # Set up the plotting area
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('KidCheck Analytics Dashboard', fontsize=16, fontweight='bold')
    
    # 1. Request Status Distribution
    status_counts = requests_df['status'].value_counts()
    axes[0, 0].pie(status_counts.values, labels=status_counts.index, autopct='%1.1f%%', startangle=90)
    axes[0, 0].set_title('Request Status Distribution')
    
    # 2. Request Type Distribution
    type_counts = requests_df['request_type'].value_counts()
    axes[0, 1].bar(type_counts.index, type_counts.values, color=['skyblue', 'lightcoral'])
    axes[0, 1].set_title('Check-in vs Check-out Requests')
    axes[0, 1].set_ylabel('Number of Requests')
    
    # 3. Daily Request Volume
    daily_requests = requests_df.groupby(requests_df['created_at'].dt.date).size()
    axes[0, 2].plot(daily_requests.index, daily_requests.values, marker='o', linewidth=2, markersize=6)
    axes[0, 2].set_title('Daily Request Volume')
    axes[0, 2].set_ylabel('Number of Requests')
    axes[0, 2].tick_params(axis='x', rotation=45)
    
    # 4. Response Time Analysis
    responded_requests = requests_df[requests_df['response_time'].notna()]
    if not responded_requests.empty:
        response_times = (responded_requests['response_time'] - responded_requests['created_at']).dt.total_seconds() / 60
        axes[1, 0].hist(response_times, bins=20, color='lightgreen', alpha=0.7, edgecolor='black')
        axes[1, 0].set_title('Response Time Distribution')
        axes[1, 0].set_xlabel('Response Time (minutes)')
        axes[1, 0].set_ylabel('Frequency')
    else:
        axes[1, 0].text(0.5, 0.5, 'No response time data', ha='center', va='center', transform=axes[1, 0].transAxes)
        axes[1, 0].set_title('Response Time Distribution')
    
    # 5. Hourly Request Pattern
    requests_df['hour'] = requests_df['created_at'].dt.hour
    hourly_requests = requests_df['hour'].value_counts().sort_index()
    axes[1, 1].bar(hourly_requests.index, hourly_requests.values, color='orange', alpha=0.7)
    axes[1, 1].set_title('Hourly Request Pattern')
    axes[1, 1].set_xlabel('Hour of Day')
    axes[1, 1].set_ylabel('Number of Requests')
    
    # 6. Top Active Parents
    parent_activity = requests_df['parent_name'].value_counts().head(10)
    if not parent_activity.empty:
        axes[1, 2].barh(parent_activity.index, parent_activity.values, color='purple', alpha=0.7)
        axes[1, 2].set_title('Most Active Parents (Top 10)')
        axes[1, 2].set_xlabel('Number of Requests')
    else:
        axes[1, 2].text(0.5, 0.5, 'No parent data', ha='center', va='center', transform=axes[1, 2].transAxes)
        axes[1, 2].set_title('Most Active Parents')
    
    plt.tight_layout()
    plt.savefig(REPORTS_DIR / 'analytics_dashboard.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"📊 Analytics dashboard saved to {REPORTS_DIR / 'analytics_dashboard.png'}")

def create_detailed_reports(requests_df, users_df, children_df, stats):
    """Create detailed text and JSON reports"""
    
    # Generate detailed text report
    report_text = f"""
KidCheck Analytics Report
Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

=== SUMMARY STATISTICS ===
Total Requests: {stats['total_requests']}
Total Parents: {stats['total_parents']}
Total Children: {stats['total_children']}

Request Status Breakdown:
- Pending: {stats['pending_requests']} ({stats['pending_requests']/max(stats['total_requests'], 1)*100:.1f}%)
- Approved: {stats['approved_requests']} ({stats['approved_requests']/max(stats['total_requests'], 1)*100:.1f}%)
- Rejected: {stats['rejected_requests']} ({stats['rejected_requests']/max(stats['total_requests'], 1)*100:.1f}%)

Request Type Breakdown:
- Check-in Requests: {stats['checkin_requests']} ({stats['checkin_requests']/max(stats['total_requests'], 1)*100:.1f}%)
- Check-out Requests: {stats['checkout_requests']} ({stats['checkout_requests']/max(stats['total_requests'], 1)*100:.1f}%)

"""
    
    if 'avg_response_time_minutes' in stats:
        report_text += f"""
=== RESPONSE TIME ANALYSIS ===
Average Response Time: {stats['avg_response_time_minutes']:.1f} minutes
Median Response Time: {stats['median_response_time_minutes']:.1f} minutes
Fastest Response: {stats['min_response_time_minutes']:.1f} minutes
Slowest Response: {stats['max_response_time_minutes']:.1f} minutes

"""
    
    if 'avg_daily_requests' in stats:
        report_text += f"""
=== ACTIVITY PATTERNS ===
Average Daily Requests: {stats['avg_daily_requests']:.1f}
Peak Daily Requests: {stats['max_daily_requests']}

"""
    
    if 'most_active_parent' in stats:
        report_text += f"""
=== TOP USERS ===
Most Active Parent: {stats['most_active_parent']} ({stats['most_active_parent_requests']} requests)

"""
    
    # Add recent activity if available
    if not requests_df.empty:
        recent_requests = requests_df[requests_df['created_at'] >= datetime.datetime.now() - datetime.timedelta(days=7)]
        report_text += f"""
=== RECENT ACTIVITY (Last 7 Days) ===
Recent Requests: {len(recent_requests)}
"""
        
        if not recent_requests.empty:
            daily_breakdown = recent_requests.groupby(recent_requests['created_at'].dt.date).size()
            for date, count in daily_breakdown.items():
                report_text += f"- {date}: {count} requests\n"
    
    # Save text report
    with open(REPORTS_DIR / 'analytics_report.txt', 'w') as f:
        f.write(report_text)
    
    # Save JSON report
    json_report = {
        'generated_at': datetime.datetime.now().isoformat(),
        'summary_stats': stats,
        'data_counts': {
            'requests': len(requests_df),
            'users': len(users_df),
            'children': len(children_df)
        }
    }
    
    # Add detailed breakdowns if data exists
    if not requests_df.empty:
        json_report['request_breakdown'] = {
            'by_status': requests_df['status'].value_counts().to_dict(),
            'by_type': requests_df['request_type'].value_counts().to_dict(),
            'by_date': requests_df.groupby(requests_df['created_at'].dt.date).size().to_dict()
        }
        
        # Convert date keys to strings for JSON serialization
        json_report['request_breakdown']['by_date'] = {
            str(k): v for k, v in json_report['request_breakdown']['by_date'].items()
        }
    
    with open(REPORTS_DIR / 'analytics_data.json', 'w') as f:
        json.dump(json_report, f, indent=2, default=str)
    
    print(f"📄 Text report saved to {REPORTS_DIR / 'analytics_report.txt'}")
    print(f"📋 JSON data saved to {REPORTS_DIR / 'analytics_data.json'}")

def export_raw_data(requests_df, users_df, children_df):
    """Export raw data to CSV files"""
    if not requests_df.empty:
        requests_df.to_csv(REPORTS_DIR / 'requests_data.csv', index=False)
        print(f"📊 Requests data exported to {REPORTS_DIR / 'requests_data.csv'}")
    
    if not users_df.empty:
        # Remove password hashes for security
        users_export = users_df.drop('password_hash', axis=1, errors='ignore')
        users_export.to_csv(REPORTS_DIR / 'users_data.csv', index=False)
        print(f"👥 Users data exported to {REPORTS_DIR / 'users_data.csv'}")
    
    if not children_df.empty:
        children_df.to_csv(REPORTS_DIR / 'children_data.csv', index=False)
        print(f"👶 Children data exported to {REPORTS_DIR / 'children_data.csv'}")

def main():
    """Main analytics function"""
    print("🔍 KidCheck Data Analytics")
    print("=" * 50)
    
    # Ensure reports directory exists
    ensure_reports_dir()
    
    # Load data
    print("📊 Loading data from database...")
    requests_df, users_df, children_df = get_data()
    
    if requests_df.empty and users_df.empty:
        print("⚠️  No data found in database. Make sure the app has been used and data exists.")
        return
    
    print(f"✅ Loaded {len(requests_df)} requests, {len(users_df)} users, {len(children_df)} children")
    
    # Generate statistics
    print("📈 Generating summary statistics...")
    stats = generate_summary_stats(requests_df, users_df, children_df)
    
    # Create visualizations
    print("📊 Creating visualizations...")
    create_visualizations(requests_df, users_df)
    
    # Create detailed reports
    print("📄 Generating detailed reports...")
    create_detailed_reports(requests_df, users_df, children_df, stats)
    
    # Export raw data
    print("💾 Exporting raw data...")
    export_raw_data(requests_df, users_df, children_df)
    
    print("\n🎉 Analytics complete!")
    print(f"📁 All reports saved to: {REPORTS_DIR.absolute()}")
    print("\nGenerated files:")
    print("- analytics_dashboard.png (Visual dashboard)")
    print("- analytics_report.txt (Detailed text report)")
    print("- analytics_data.json (Machine-readable data)")
    print("- requests_data.csv (Raw requests data)")
    print("- users_data.csv (Raw users data)")
    print("- children_data.csv (Raw children data)")

if __name__ == '__main__':
    main()
